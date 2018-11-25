const mysql = require('mysql');
/*
Download a free MySQL database at https://www.mysql.com/downloads/.
*/

const dbpassword = process.env.DB_PASSWORD;
const dbuser = process.env.DB_USER;
// Use the username and password from our MySQL database.
const con = mysql.createConnection({
  host: "localhost",
  user: dbuser,
  password: dbpassword,
  database: "outbooked"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");
  var sql = "CREATE TABLE interviewers (access VARCHAR(255), token VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});
