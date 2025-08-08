const express = require('express');
const cors = require('cors'); // Import CORS package
const app = express();
const port = 3006;
const cron = require('node-cron');
const axios = require('axios');

// Import routes
const userRoutes = require('./router/users');
const historyRoutes = require('./router/histories');
const recordRoutes = require('./router/records');
const adminRoutes = require('./router/admins');
const roleRoutes = require('./router/roles');
const appRoutes = require('./router/app');

// Import database and other configs
const { connectDB } = require('./config/db');
const { fetchCurrentGameData, fetchNBAData } = require('./config/service/nba-service');

// Connect to the database
connectDB();

// Middleware (optional: for parsing JSON or static files)
// app.use(cors({
//   origin: ['https://backoffice-nba.cquiz.app', 'http://localhost:3000'], // Allow both production and local development
// }));
app.use(express.json());

// Use the routes
app.use('/user', userRoutes);
app.use('/history', historyRoutes);
app.use('/record', recordRoutes);
app.use('/admin', adminRoutes);
app.use('/role', roleRoutes);
app.use('/v1/app', appRoutes)

cron.schedule('0 * * * *', async () => {
  console.log('Running Cron Job at', new Date().toLocaleString());
  const response = await axios.get(`https://api-nba.cquiz.app/v1/app/nba`);

  // Optional: Use the response data in your Discord message
  const message = {
    content: `🕐 [NBA]Cron Job ran at ${new Date().toLocaleString()}.\nNBA data nba status: ${response.status}`
  };

  // Send message to Discord via webhook
  await axios.post(
    'https://discord.com/api/webhooks/1375409779249516554/7DefABFVzS4YQ9Rfg7-bdcOW8ElddRO9FgmwYix6O4YAFD8DlBuJ8o0XbykRN8Pa-Rru',
    message
  );
});

cron.schedule('0 * * * *', async () => {
  console.log('Running Cron Job at', new Date().toLocaleString());
  const response = await axios.get(`https://api-nba.cquiz.app/v1/app/retry-nba`);

  // Optional: Use the response data in your Discord message
  const message = {
    content: `🕐 [RETRY-NBA]Cron Job ran at ${new Date().toLocaleString()}.\nNBA data retry-nba status: ${response.status}`
  };

  // Send message to Discord via webhook
  await axios.post(
    'https://discord.com/api/webhooks/1375409779249516554/7DefABFVzS4YQ9Rfg7-bdcOW8ElddRO9FgmwYix6O4YAFD8DlBuJ8o0XbykRN8Pa-Rru',
    message
  );
});

// cron.schedule('0 14 * * *', () => {
//   console.log('Running Cron Job at', new Date().toLocaleString());
//   fetchCurrentGameData()
// });

// cron.schedule('0 15 * * *', () => {
//   console.log('Running Cron Job at', new Date().toLocaleString());
//   fetchCurrentGameData()
// });

// cron.schedule('0 16 * * *', () => {
//   console.log('Running Cron Job at', new Date().toLocaleString());
//   fetchCurrentGameData()
// });

// cron.schedule('0 17 * * *', () => {
//   console.log('Running Cron Job at', new Date().toLocaleString());
//   fetchCurrentGameData()
// });

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});