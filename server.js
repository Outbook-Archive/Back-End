require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;

// dbConnection
require('./dbConnection/mongo');

// Body Parser
// MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Cookie Parser
app.use(cookieParser());

// Disables CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
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

app.listen(port, () => {
    console.log(`Listening on server port: ${port}`);
});

// This is for testing purposes
module.exports = { app };
