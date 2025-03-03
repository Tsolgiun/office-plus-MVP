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

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username;
    user.email = email;
    user.phone = phone;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};


// AI response using predefined responses
const getAIresponse = async (req, res) => {
  try {
    const { message } = req.query;
    const userId = req.user?._id ? req.user._id.toString() : 'anonymous';

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'No message provided'
      });
    }
    
    console.log(`User ID for session: ${userId}`);
    
    // Get session if exists
    const sessionId = sessionStore.get(userId);
    console.log(`Current session ID: ${sessionId || 'none'}`);
    
    // DashScope API credentials
    const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-8da8842dcb5f4c0bb6421fe2fd76e6d0';
    const appId = 'c8159539b1194623b52be93606c4727d';
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;
    
    console.log(`Processing request for message: ${message}`);
    
    try {
      // Call DashScope API
      const response = await axios.post(url, {
        input: { 
          prompt: message, 
          session_id: sessionId || undefined 
        },
        parameters: {},
        debug: {}
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle successful response
      if (response.status === 200 && response.data && response.data.output) {
        // Store session ID for future conversations
        if (response.data.output.session_id) {
          const newSessionId = response.data.output.session_id;
          sessionStore.set(userId, newSessionId);
          console.log(`New session ID stored: ${newSessionId} for user: ${userId}`);
        }
        
        console.log('Response received from API');
        
        return res.json({
          success: true,
          response: response.data.output.text
        });
      } else {
        throw new Error(`Invalid response structure: ${JSON.stringify(response.data)}`);
      }
    } catch (apiError) {
      console.error('API call failed:', apiError.message);
      
      // Fallback responses
      const fallbackResponses = {
        "hello": "Hello! How can I help you with office spaces today?",
        "hi": "Hi there! Looking for an office space?",
        "office": "We offer various office spaces from private offices to open floors.",
        "price": "Our prices range from ¥3,000 to ¥15,000 per square meter monthly.",
        "booking": "You can book through our website by clicking 'Book Viewing'.",
        "default": "I'm here to help with your office space needs. What would you like to know?"
      };
      
      // Find matching response or use default
      let fallbackResponse = fallbackResponses.default;
      const lowerMessage = message.toLowerCase();
      
      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (lowerMessage.includes(key)) {
          fallbackResponse = value;
          break;
        }
      }
      
      return res.json({
        success: true,
        response: fallbackResponse
      });
    }
  } catch (error) {
    console.error('Error in AI response:', error);
    res.write(`event: error\ndata: ${JSON.stringify({
      error: 'Internal server error'
    })}\n\n`);
    res.end();
  }
};

// 辅助函数：获取默认回复
function getFallbackResponse(message) {
  const fallbackResponses = {
    "hello": "Hello! How can I help you with office spaces today?",
    "hi": "Hi there! Looking for an office space?",
    // ...其他默认回复
  };
  
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(fallbackResponses)) {
    if (lowerMessage.includes(key)) return value;
  }
  return fallbackResponses.default;
}

module.exports = {
  register,
  login,
  getProfile,
  getAIresponse,
  updateProfile,
};
