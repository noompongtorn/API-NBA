const nbaService = require('../service/nba-service');

// Fetch NBA Data
const fetchNBAData = async (req, res) => {
    try {
        await nbaService.fetchNBAData();
        res.status(200).send('NBA data fetched and saved successfully');
    } catch (error) {
        console.error('Error fetching NBA data:', error.message);
        res.status(500).json({ error: 'Failed to fetch NBA data' });
    }
};

const retryScore = async (req, res) => {
    try {
        await nbaService.fetchCurrentGameData();
        res.status(200).send('NBA data fetched and saved successfully');
    } catch (error) {
        console.error('Error fetching NBA data:', error.message);
        res.status(500).json({ error: 'Failed to fetch NBA data' });
    }
};

// Fetch Home Page Data
const getHomePageData = async (req, res) => {
    try {
        const homePageData = await nbaService.getHomePageData(req.user.userId);
        res.json(homePageData);
    } catch (error) {
        console.error('Error fetching home page data:', error.message);
        res.status(500).json({ error: 'Failed to fetch home page data' });
    }
};

// Fetch Home Page Data
const getAdminHomePageData = async (req, res) => {
    try {
        const homePageData = await nbaService.getHomePageData(req.params.id);
        res.json(homePageData);
    } catch (error) {
        console.error('Error fetching home page data:', error.message);
        res.status(500).json({ error: 'Failed to fetch home page data' });
    }
};

// Fetch Home Page Data
const getHistoryPageData = async (req, res) => {
    try {
        const homePageData = await nbaService.getHistoryPageData(req.user.userId, req.query.teamId);

        res.json(homePageData);
    } catch (error) {
        console.error('Error fetching home page data:', error.message);
        res.status(500).json({ error: 'Failed to fetch home page data' });
    }
};

const getTotalData = async (req, res) => {
    try {
        const homePageData = await nbaService.getTotalData(req.user.userId, req.query.teamId);

        res.json(homePageData);
    } catch (error) {
        console.error('Error fetching home page data:', error.message);
        res.status(500).json({ error: 'Failed to fetch home page data' });
    }
};

const condition = async (req, res) => {
    try {
        const conditions = await nbaService.condition();

        res.json(conditions);
    } catch (error) {
        console.error('Error fetching home page data:', error.message);
        res.status(500).json({ error: 'Failed to fetch home page data' });
    }
};

const createCondition = async (req, res) => {
    try {
        await nbaService.createCondition(req.body);

        res.json("success");
    } catch (error) {
        console.error('Error fetching home page data:', error.message);
        res.status(500).json({ error: 'Failed to fetch home page data' });
    }
};

module.exports = {
    fetchNBAData,
    getHomePageData,
    retryScore,
    getTotalData,
    getHistoryPageData,
    condition,
    createCondition,
    getAdminHomePageData
};
