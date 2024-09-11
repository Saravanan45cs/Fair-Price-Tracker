const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5001; 

app.use(cors());
app.use(bodyParser.json());

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
});

// Login route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body; // Only email and password

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`; // Query based on email

  db.query(sql, [email], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = results[0];

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token, message: 'Login successful' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
