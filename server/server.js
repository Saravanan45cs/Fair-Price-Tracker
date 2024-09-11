const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./config/db'); // Check this path
const apiRoutes = require('./routes/api'); // Check this path

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
