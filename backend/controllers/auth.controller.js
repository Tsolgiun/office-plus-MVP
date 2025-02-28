const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// AI response using predefined responses
const getAIresponse = async (req, res) => {
  try {
    const { message } = req.query;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'No message provided'
      });
    }

    // Predefined responses
    const responses = {
      "hello": "Hello! How can I help you with office spaces today?",
      "hi": "Hi there! Looking for an office space?",
      "office": "We offer various office spaces from private offices to open floors.",
      "price": "Our prices range from ¥3,000 to ¥15,000 per square meter monthly.",
      "booking": "You can book through our website by clicking 'Book Viewing'.",
      "default": "I'm here to help with your office space needs. What would you like to know?"
    };
    
    // Find matching response or use default
    let response = responses.default;
    const lowerMessage = message.toLowerCase();
    
    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }
    
    return res.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('Error in AI response:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI response',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAIresponse,
};
