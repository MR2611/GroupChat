const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User'); // Define a User model for your database

const app = express();
app.use(bodyParser.json());

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database:', err));

// Secret key for JWT
const secretKey = 'your-secret-key'; // Replace with a strong secret key for production

// Route for handling user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // If the password matches, create a JWT with the user's ID
    const payload = { userId: user._id };
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    // Send the JWT to the frontend
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
