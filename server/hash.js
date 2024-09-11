const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Saravanan007',
  database: 'fairprice',
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');

  // Fetch all users with plain text passwords
  const fetchUsersQuery = 'SELECT id, password FROM users';
  db.query(fetchUsersQuery, async (err, results) => {
    if (err) throw err;

    for (const user of results) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Update the user's password with the hashed version
      const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
      db.query(updateQuery, [hashedPassword, user.id], err => {
        if (err) throw err;
        console.log(`Password for user ID ${user.id} updated successfully.`);
      });
    }
    console.log('All passwords updated to hashed versions.');
    db.end(); // Close the database connection
  });
});
