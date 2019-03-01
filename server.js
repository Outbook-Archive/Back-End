require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const app = express();
const port = process.env.PORT;

// dbConnection
require('./dbConnection/mongo');

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie Parser
app.use(cookieParser());

// Disables CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CROSS_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Import the routes
const index = require('./routes/index');
const authorize = require('./routes/authorize');
const calendar = require('./routes/calendar');

// Tell app to use the routes
app.use(index);
app.use(authorize);
app.use(calendar);

// Run cron jobs
const { refreshTokens } = require('./helpers/auth');
cron.schedule('0 * * * *', () => {
  // Refreshes tokens every hour
  refreshTokens()
});

app.listen(port, () => {
    console.log(`Listening on server port: ${port}`);
});
