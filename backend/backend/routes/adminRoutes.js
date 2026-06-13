const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'admin_super_secret_key_2024';

// Admin Login - Sets HTTP-only cookie
router.post('/login', async (req, res) => {
  console.log('Admin login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const db = mongoose.connection.db;
    const admin = await db.collection('admins').findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    // Set HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });
    
    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Admin Token
router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = mongoose.connection.db;
    const admin = await db.collection('admins').findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });
    
    if (!admin) {
      return res.status(401).json({ authenticated: false });
    }
    
    res.json({
      authenticated: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

// Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get Admin Dashboard Data (Protected)
router.get('/dashboard', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    jwt.verify(token, JWT_SECRET);
    
    // Fetch dashboard data
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find().sort({ createdAt: -1 }).toArray();
    const products = await db.collection('products').find().toArray();
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    res.json({
      orders,
      products,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
