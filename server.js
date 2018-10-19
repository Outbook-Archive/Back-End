const express = require('express');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Import the routes
const index = require('./routes/index');
var authorize = require('./routes/authorize');

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

app.listen(port, () => {
    console.log(`Listening on server port: ${port}`);
});

module.exports = app;
