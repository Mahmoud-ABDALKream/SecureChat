import jwt from 'jsonwebtoken';
import forge from 'node-forge';
import User from '../models/User.js';

// Generate RSA key pair
const generateRSAKeyPair = () => {
  const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  
  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate RSA key pair
    const { publicKey, privateKey } = generateRSAKeyPair();

    // Create user
    const user = await User.create({
      username,
      passwordHash: password,
      publicKey,
      privateKey,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      publicKey: user.publicKey,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      publicKey: user.publicKey,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
