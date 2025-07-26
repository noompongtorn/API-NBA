const express = require('express');
const router = express.Router();
const { authenticate } = require('../config/middleware');

const authService = require('../config/service/auth-service')
const userService = require('../config/service/user-service')
const recordService = require('../config/service/records-service')
const nbaController = require('../config/controller/nbaController');
const { pool } = require('../config/db');
const { getTotalData } = require('../config/service/nba-service');

router.post('/register', authService.register);
router.post('/register-admin', authService.registerAdmin);
router.post('/login', authService.login);

router.get('/profile/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const playersQuery = "SELECT json_response FROM nba WHERE type = 'players' ORDER BY created_at DESC LIMIT 1";
        const currentGameQuery = "SELECT json_response FROM nba WHERE type = 'currentGames' ORDER BY created_at DESC LIMIT 1";
        const nextGameQuery = "SELECT json_response FROM nba WHERE type = 'nextGames' ORDER BY created_at DESC LIMIT 1";

        const [players] = await Promise.all([
            await pool.query(playersQuery, [])
        ]);

        const total = await Promise.all(players.rows[0]?.json_response?.result?.map(async (item) => {
            const homePageData = await getTotalData(user.id, item.Name);
            const totals = homePageData.totals.toString();

            return (totals == 'null' | totals == 'NaN') ? 0 : +homePageData.totals
        }))

        res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                total: total.reduce((cum, item) => cum + item, 0)
            },
        });
    } catch (err) {
        console.error('Error during login', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/record', authenticate, recordService.createRecord);
router.get('/records', authenticate, recordService.records);
router.get('/nba', nbaController.fetchNBAData);
router.get('/retry-nba', nbaController.retryScore);

router.get('/home-page.list', authenticate, nbaController.getHomePageData);
router.get('/history.list', authenticate, nbaController.getHistoryPageData);
router.get('/totals', authenticate, nbaController.getTotalData);
router.post('/favorite-page.list', authenticate, userService.favorites);
router.post('/favorite', authenticate, userService.favorite);

router.get('/condition', nbaController.condition);
router.post('/condition', nbaController.createCondition);

router.get('/admin-home-page.list/:id', nbaController.getAdminHomePageData);
router.get('/admin-profile/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const playersQuery = "SELECT json_response FROM nba WHERE type = 'players' ORDER BY created_at DESC LIMIT 1";
        const currentGameQuery = "SELECT json_response FROM nba WHERE type = 'currentGames' ORDER BY created_at DESC LIMIT 1";
        const nextGameQuery = "SELECT json_response FROM nba WHERE type = 'nextGames' ORDER BY created_at DESC LIMIT 1";

        const [players] = await Promise.all([
            await pool.query(playersQuery, [])
        ]);

        const total = await Promise.all(players.rows[0]?.json_response?.result?.map(async (item) => {
            const homePageData = await getTotalData(user.id, item.Name);
            const totals = homePageData.totals.toString();

            return (totals == 'null' | totals == 'NaN') ? 0 : +homePageData.totals
        }))

        res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                total: total.reduce((cum, item) => cum + item, 0)
            },
        });
    } catch (err) {
        console.error('Error during login', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
