const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');  // Import jsonwebtoken

// Import User model
const User = require('./models/user');  // Import the User model

// MongoDB connection
mongoose.connect('mongodb+srv://rizwan2001:rizwan2001@cluster0.6ucejfl.mongodb.net/ecounit?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Register a user
app.post('/register', async (req, res) => {
  const { name, rollNo, admissionNo, department, email, password } = req.body;

  // Basic validations
  if (!name || !rollNo || !admissionNo || !department || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (rollNo.length > 3) {
    return res.status(400).json({ message: 'Roll number must be 3 digits or less' });
  }
  if (admissionNo.length !== 7) {
    return res.status(400).json({ message: 'Admission number must be exactly 7 digits' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      rollNo,
      admissionNo,
      department,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login a user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret_key', { expiresIn: '1h' });
  
      res.status(200).json({
        message: 'Login successful',
        token, 
        user,
      });
    } catch (error) {
      console.error(error);  // Log error for debugging
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });
  

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
