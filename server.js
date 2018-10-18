const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Import the routes
const index = require('./routes/index');

const app = express();
const port = process.env.PORT;

// TODO: Future db connection

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Cookie Parser
app.use(cookieParser());

// Tell app to use the routes
app.use('/', index);

app.listen(port, () => {
    console.log(`Listening on server port: ${port}`);
});

module.exports = app;
