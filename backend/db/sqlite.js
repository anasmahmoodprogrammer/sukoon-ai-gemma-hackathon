const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'analytics.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Table for total conversations / topic trends
        db.run(`CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            count INTEGER DEFAULT 1
        )`);

        // Table for crisis events
        db.run(`CREATE TABLE IF NOT EXISTS crisis_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Table for conversation tracking (just counting totals)
        db.run(`CREATE TABLE IF NOT EXISTS conversations (
            session_id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

function logConversation(sessionId) {
    db.run(`INSERT OR IGNORE INTO conversations (session_id) VALUES (?)`, [sessionId], (err) => {
        if (err) console.error('Error logging conversation:', err.message);
    });
}

function logTopic(topic) {
    if (!topic) return;
    db.get(`SELECT id FROM topics WHERE topic = ?`, [topic], (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (row) {
            db.run(`UPDATE topics SET count = count + 1 WHERE id = ?`, [row.id]);
        } else {
            db.run(`INSERT INTO topics (topic) VALUES (?)`, [topic]);
        }
    });
}

function logCrisisEvent(sessionId) {
    db.run(`INSERT INTO crisis_events (session_id) VALUES (?)`, [sessionId], (err) => {
        if (err) console.error('Error logging crisis event:', err.message);
    });
}

function getStats(callback) {
    let stats = {
        totalConversations: 0,
        escalationCount: 0,
        topStressCategories: []
    };

    db.get(`SELECT COUNT(*) as count FROM conversations`, [], (err, row) => {
        if (!err) stats.totalConversations = row.count;

        db.get(`SELECT COUNT(*) as count FROM crisis_events`, [], (err, row) => {
            if (!err) stats.escalationCount = row.count;

            db.all(`SELECT topic, count FROM topics ORDER BY count DESC LIMIT 5`, [], (err, rows) => {
                if (!err) stats.topStressCategories = rows;
                callback(stats);
            });
        });
    });
}

module.exports = {
    db,
    logConversation,
    logTopic,
    logCrisisEvent,
    getStats
};
