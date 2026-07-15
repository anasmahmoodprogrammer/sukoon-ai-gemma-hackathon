require('dotenv').config();
const express = require('express');
const cors = require('cors');

const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mount routes
app.use('/api', chatRoutes);
app.use('/api', analyticsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

app.listen(PORT, () => {
    console.log(`Sukoon AI backend listening on port ${PORT}`);
});
