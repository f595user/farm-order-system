const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { ensureAuthenticated, ensureOwnerOrAdmin } = require('../middleware/auth');

// @route   GET /api/users/auth/google
// @desc    Auth with Google
// @access  Public
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/users/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/');
  }
);

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password
    });
    
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/users/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  })(req, res, next);
});

// @route   GET /api/users/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/users/current
// @desc    Get current user
// @access  Private
router.get('/current', ensureAuthenticated, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    addresses: req.user.addresses
  });
});

// @route   PUT /api/users/:userId
// @desc    Update user profile
// @access  Private (owner or admin)
router.put('/:userId', ensureOwnerOrAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
});

// @route   POST /api/users/:userId/addresses
// @desc    Add a new address
// @access  Private (owner or admin)
router.post('/:userId/addresses', ensureOwnerOrAdmin, async (req, res) => {
  try {
    const { name, phone, address, city, postalCode, isDefault } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If new address is default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    user.addresses.push({
      name,
      phone,
      address,
      city,
      postalCode,
      isDefault: isDefault || false
    });
    
    await user.save();
    
    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error while adding address' });
  }
});

// @route   PUT /api/users/:userId/addresses/:addressId
// @desc    Update an address
// @access  Private (owner or admin)
router.put('/:userId/addresses/:addressId', ensureOwnerOrAdmin, async (req, res) => {
  try {
    const { name, phone, address, city, postalCode, isDefault } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If updated address is default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      name: name || user.addresses[addressIndex].name,
      phone: phone || user.addresses[addressIndex].phone,
      address: address || user.addresses[addressIndex].address,
      city: city || user.addresses[addressIndex].city,
      postalCode: postalCode || user.addresses[addressIndex].postalCode,
      isDefault: isDefault || user.addresses[addressIndex].isDefault
    };
    
    await user.save();
    
    res.json({ addresses: user.addresses });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error while updating address' });
  }
});

// @route   DELETE /api/users/:userId/addresses/:addressId
// @desc    Delete an address
// @access  Private (owner or admin)
router.delete('/:userId/addresses/:addressId', ensureOwnerOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    user.addresses.splice(addressIndex, 1);
    
    await user.save();
    
    res.json({ addresses: user.addresses });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error while deleting address' });
  }
});

module.exports = router;
