const { pool } = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getTotalData } = require("./nba-service");

const JWT_SECRET = 'your_jwt_secret_key';

const queryDatabase = async (query, params, res) => {
    try {
        const result = await pool.query(query, params);
        return result;
    } catch (err) {
        console.error('Error executing query', err);
        if (res) {
            res.status(500).json({ error: 'Database error' });
            throw err;
        }

        throw err;
    }
};

const register = async (req, res) => {
    const { firstName, lastName, username, email, password, phone } = req.body;

    // Validate input
    if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if username or email already exists
        const checkQuery = 'SELECT * FROM users WHERE username = $1';
        const checkResult = await queryDatabase(checkQuery, [username], res);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const insertQuery = `
            INSERT INTO users (firstName, lastName, username, email, password, role_id, phone) 
            VALUES ($1, $2, $3, $4, $5, 2, $6) RETURNING id, firstName, lastName, username, email
        `;
        const insertResult = await queryDatabase(insertQuery, [firstName, lastName, username, email, hashedPassword, phone], res);

        // Generate a token for the new user
        const newUser = insertResult.rows[0];
        const token = jwt.sign({ userId: newUser.id, role: 1 }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            user: newUser,
            token,
        });
    } catch (err) {
        console.error('Error during registration', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const registerAdmin = async (req, res) => {
    const { firstName, lastName, username, email, password, phone } = req.body;

    // Validate input
    if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if username or email already exists
        const checkQuery = 'SELECT * FROM users WHERE username = $1';
        const checkResult = await queryDatabase(checkQuery, [username], res);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const insertQuery = `
            INSERT INTO users (firstName, lastName, username, email, password, role_id, phone) 
            VALUES ($1, $2, $3, $4, $5, 1, $6) RETURNING id, firstName, lastName, username, email
        `;
        const insertResult = await queryDatabase(insertQuery, [firstName, lastName, username, email, hashedPassword, phone], res);

        // Generate a token for the new user
        const newUser = insertResult.rows[0];
        const token = jwt.sign({ userId: newUser.id, role: 1 }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            user: newUser,
            token,
        });
    } catch (err) {
        console.error('Error during registration', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND role_id = 2', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const playersQuery = "SELECT json_response FROM nba WHERE type = 'players' ORDER BY created_at DESC LIMIT 1";
        const currentGameQuery = "SELECT json_response FROM nba WHERE type = 'currentGames' ORDER BY created_at DESC LIMIT 1";
        const nextGameQuery = "SELECT json_response FROM nba WHERE type = 'nextGames' ORDER BY created_at DESC LIMIT 1";

        const [players] = await Promise.all([
            queryDatabase(playersQuery, []),
        ]);

        const total = await Promise.all(players.rows[0]?.json_response?.result?.map(async (item) => {
            const homePageData = await getTotalData(user.id, item.Name);
            const totals = homePageData.totals.toString();

            return (totals == 'null' | totals == 'NaN') ? 0 : +homePageData.totals
        }))

        const token = jwt.sign({ userId: user.id, role: user.role_id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                total: total.reduce((cum, item) => cum + item, 0)
            },
            token,
        });
    } catch (err) {
        console.error('Error during login', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const user = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1 AND role_id = 2', [id]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role_id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error('Error during login', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { register, login, registerAdmin };