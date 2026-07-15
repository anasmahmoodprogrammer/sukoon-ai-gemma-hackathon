const express = require('express');
const router = express.Router();
const dbLogic = require('../db/sqlite');

router.get('/stats', (req, res) => {
    dbLogic.getStats((stats) => {
        res.json(stats);
    });
});

module.exports = router;
