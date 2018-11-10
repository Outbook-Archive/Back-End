const express = require('express');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Import the routes
const index = require('./routes/index');
const authorize = require('./routes/authorize');
const calendar = require('./routes/calendar');

const app = express();
const port = process.env.PORT;

// TODO: Future db connection

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie Parser
app.use(cookieParser());

// Tell app to use the routes
app.use('/', index);
app.use('/authorize', authorize);
app.use('/calendar', calendar);

app.listen(port, () => {
    console.log(`Listening on server port: ${port}`);
});

// module.exports = app;
