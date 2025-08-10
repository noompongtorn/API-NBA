const express = require("express");
const cors = require("cors"); // Import CORS package
const app = express();
const port = 3006;
const cron = require("node-cron");
const axios = require("axios");

// Import routes
const userRoutes = require("./router/users");
const historyRoutes = require("./router/histories");
const recordRoutes = require("./router/records");
const adminRoutes = require("./router/admins");
const roleRoutes = require("./router/roles");
const appRoutes = require("./router/app");

// Import database and other configs
const { connectDB } = require("./config/db");
const {
  fetchCurrentGameData,
  fetchNBAData,
} = require("./config/service/nba-service");

// Connect to the database
connectDB();

// Middleware (optional: for parsing JSON or static files)
app.use(
  cors({
    origin: [
      "http://ygevo.myvnc.com",
      "https://ygevo.myvnc.com",
      "http://localhost:3000",
    ], // Allow both production and local development
  })
);
app.use(express.json());

// Use the routes
app.use("/nba/api/user", userRoutes);
app.use("/nba/api/history", historyRoutes);
app.use("/nba/api/record", recordRoutes);
app.use("/nba/api/admin", adminRoutes);
app.use("/nba/api/role", roleRoutes);
app.use("/nba/api/v1/app", appRoutes);

// cron.schedule("0 * * * *", async () => {
//   await axios.get(`http://ygevo.myvnc.com/wnba/api/v1/app/nba`);
// });

// cron.schedule("0 * * * *", async () => {
//   await axios.get(`http://ygevo.myvnc.com/wnba/api/v1/app/retry-nba`);
// });

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
