const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Saravanan007',
  database: 'fairprice'
});

module.exports = pool.promise();
