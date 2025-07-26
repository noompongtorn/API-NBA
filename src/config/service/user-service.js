const { pool } = require('../../config/db');

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

const findFavorite = async (userId, teamId) => {
  const queryScript = `
                  select 
                    * 
                  from 
                    favorites
                  WHERE
                    user_id = '${userId}' and team_id = '${teamId}'
                  `

  return await queryDatabase(queryScript, null)
}

const removeFavorite = async (favoriteId) => {
  const queryScript = `
                  DELETE 
                  FROM 
                    favorites
                  WHERE 
                    id='${favoriteId}';
                  `

  return await queryDatabase(queryScript, null)
}

const insertFavorite = async (userId, teamId) => {
  const queryScript = `
                  INSERT INTO favorites
                      (user_id, team_id)
                  VALUES('${userId}', '${teamId}');
                  `

  return await queryDatabase(queryScript, null)
}

const findFavorites = async (userId) => {
  const queryScript = `
                  select 
                    * 
                  from 
                    favorites
                  WHERE
                    user_id = '${userId}'
                  `

  return await queryDatabase(queryScript, null)
}

const users = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter, default to 1
  const limit = 10; // Define the number of records per page
  const offset = (page - 1) * limit; // Calculate the offset
  const search = req.query.search ? req.query.search.toLowerCase() : ''; // Get the search term from query parameter

  const searchTerm = `%${search}%`;

  const query = `
    SELECT 
      u.id AS user_id,
      u.firstName,
      u.lastName,
      u.username,
      u.email,
      u.created_at,
      w.balance,
      w.currency,
      h.action AS last_action,
      h.created_at AS last_action_time,
      CONCAT(u.firstName, ' ', u.lastName) AS fullName
    FROM 
      users u
    LEFT JOIN wallets w ON u.id = w.user_id
    LEFT JOIN (
      SELECT DISTINCT ON (user_id) 
        user_id, action, created_at
      FROM histories
      ORDER BY user_id, created_at DESC
    ) h ON u.id = h.user_id
    WHERE 
      CONCAT(u.firstName, ' ', u.lastName) ILIKE '${searchTerm}' OR u.email ILIKE '${searchTerm}' 
    LIMIT ${10} OFFSET ${offset}
  `;

  await queryDatabase(query, res);
}

const profile = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter, default to 1
  const limit = 10; // Define the number of records per page
  const offset = (page - 1) * limit; // Calculate the offset
  const userId = req.user.userId

  const query = `
    SELECT 
      u.id AS user_id,
      u.firstName,
      u.lastName,
      u.username,
      u.email,
      u.created_at,
      w.balance,
      w.currency,
      h.action AS last_action,
      h.created_at AS last_action_time,
      CONCAT(u.firstName, ' ', u.lastName) AS fullName
    FROM 
      users u
    LEFT JOIN wallets w ON u.id = w.user_id
    LEFT JOIN (
      SELECT DISTINCT ON (user_id) 
        user_id, action, created_at
      FROM histories
      ORDER BY user_id, created_at DESC
    ) h ON u.id = h.user_id
    WHERE 
      u.id = '${userId}' 
    LIMIT ${10} OFFSET ${offset}
  `;

  await queryDatabase(query, res);
}

const updateProfile = async (userId, body) => {
  const query = `
          UPDATE 
            users 
          SET 
            firstName = '${body.firstName}',
            lastName = '${body.lastName}',
            phone = '${body.phone}'
          WHERE id = '${userId}'`;

  await queryDatabase(query, null);
}

const favorite = async (req, res) => {
  const userId = req.user.userId;
  const teamId = req.body.teamId;

  const favorite = await findFavorite(userId, teamId)
  if (favorite.rows?.length === 0) {
    await insertFavorite(userId, teamId)

    res.send(`User details for user ${userId}`);
    return
  }

  await removeFavorite(favorite.rows[0].id)

  res.send(`User details for user ${userId}`);
}

const favorites = async (req, res) => {
  const userId = req.user.userId;
  const results = await findFavorites(userId)

  res.send(results);
}

const putProfile = async (req, res) => {
  const userId = req.user.userId;
  await updateProfile(userId, req.body)

  res.send(`User details for user ${userId}`);
}

module.exports = { users, profile, favorite, favorites, putProfile };
