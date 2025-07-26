const { pool } = require("../db");

const queryDatabase = async (query, res) => {
    try {
        const result = await pool.query(query);
        if (!res) {
            return result
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        if (!res) {
            return err
        }

        res.status(500).json({ error: 'Database error' });
    }
};


const records = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? req.query.search.toLowerCase() : '';

    const searchTerm = `%${search}%`;

    const query = `
            SELECT * 
            FROM records 
            WHERE name ILIKE '${searchTerm}' 
            LIMIT ${10} 
            OFFSET ${offset}`;
    await queryDatabase(query, res);
}

const detail = (req, res) => {
    const historyId = req.params.id;
    res.send(`History details for history ${historyId}`);
}

const recordByUserId = async (uid) => {
    const query = `
            SELECT * 
            FROM records 
            WHERE user_id = '${uid}' and record_type = 'nba'
        `;
    return await queryDatabase(query, null);
}

const recordByFetchData = async () => {
    const query = `
            SELECT * 
            FROM records 
            WHERE record_type = 'nba'
        `;
    return await queryDatabase(query, null);
}

const createRecord = async (req, res) => {
    const query = `
            INSERT INTO records 
                ( user_id, name, record_data, random, status ) 
            VALUES 
                ( '${req.user.userId}','${req.body.name}' ,'${JSON.stringify(req.body.content)}', 
                '{ "random": ${JSON.stringify(req.body.random)} }' ,'active')`;

    await queryDatabase(query, res);
}

const internalCreateRecord = async (id, content) => {
    const query = `
            UPDATE records 
            SET record_data = '${JSON.stringify(content)}',
                status = 'inactive'
            WHERE id = '${id}'`;

    await queryDatabase(query, null);
}

const getRecordByUserId = async (uid) => {
    const query = `
            SELECT * 
            FROM 
                records 
            WHERE 
                user_id = '${uid}' and status = 'active'
        `;

    return await queryDatabase(query, null);
}

const conditionList = async () => {
    const query = `
            SELECT * 
            FROM conditions
        `;
    return await queryDatabase(query, null);
}

module.exports = { records, detail, createRecord, recordByUserId, recordByFetchData, internalCreateRecord, conditionList };