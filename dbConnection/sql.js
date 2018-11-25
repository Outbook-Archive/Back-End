const mysql = require('mysql');
/*
Download a free MySQL database at https://www.mysql.com/downloads/.
*/

const dbpassword = process.env.DB_PASSWORD;
const dbuser = process.env.DB_USER;
// Use the username and password from our MySQL database.
const connection = mysql.createConnection({
  host: "localhost",
  user: dbuser,
  password: dbpassword
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
