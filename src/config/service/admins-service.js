// Hypothetical service function to handle business logic
const calculateSomething = (data) => {
  // Business logic processing
  return data * 2;
};

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

module.exports = { calculateSomething, users };
