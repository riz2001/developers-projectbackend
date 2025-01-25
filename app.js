const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Survey = require("./models/survey");   // Import jsonwebtoken

// Import User model
const User = require('./models/user');  
const Score = require('./models/score'); // Correct capitalization
 // Import the User model

// MongoDB connection
mongoose.connect("mongodb", {
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
      userId: user._id,  // Send userId as part of the response
      user,
    });
  } catch (error) {
    console.error(error);  // Log error for debugging
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});
  
app.post('/quiz/score', async (req, res) => {
  const { score, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Validate that `score` is a number
  if (typeof score !== 'number' || isNaN(score)) {
    return res.status(400).json({ message: 'Invalid score. It must be a valid number.' });
  }

  try {
    // 1. Update the user's quiz score in the primary database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.quizScore = score; // Ensure score is a number
    await user.save();

    // 2. Save the quiz score in the secondary database
    const newScore = new Score({
      userId: userId,
      scored: score, // Ensure 'scored' matches your schema field name
    });
    await newScore.save();
    

    res.status(200).json({ message: 'Score saved successfully', score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving score', error });
  }
});

app.get('/quiz/scores', async (req, res) => {
  try {
    const scoresData = await Score.find()
      .populate('userId', 'name') // Populate userId with name from User model
      .select('scored date userId'); // Only select specific fields

    res.status(200).json({ scores: scoresData });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ message: 'Error fetching scores' });
  }
});
app.post("/survey", async (req, res) => {
  const { userId, usageFrequency, healthRiskAwareness, alternativesUsed, environmentalConcern, challenges, supportTechSolutions, motivation, additionalFeedback } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const newSurvey = new Survey({
      userId,
      usageFrequency,
      healthRiskAwareness,
      alternativesUsed,
      environmentalConcern,
      challenges,
      supportTechSolutions,
      motivation,
      additionalFeedback,
    });

    await newSurvey.save();
    res.status(201).json({ message: "Survey submitted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to save survey data.", error: err.message });
  }
});

app.get("/survey/all", async (req, res) => {
  try {
    const surveys = await Survey.find({}).populate("userId", "name department"); // Assuming userId is a reference to User model
    if (surveys.length === 0) {
      return res.status(404).json({ message: "No survey data found." });
    }
    res.status(200).json(surveys);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve survey data.", error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
