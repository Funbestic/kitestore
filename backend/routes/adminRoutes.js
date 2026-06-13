const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'admin_super_secret_key_2024';

// Verify admin token
router.get('/verify', async (req, res) => {
  const token = req.cookies?.adminToken;
  
  if (!token) {
    return res.json({ authenticated: false });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.json({ authenticated: false });
    }
    res.json({ authenticated: true, admin });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '8h' });
    
    res.cookie('adminToken', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000
    });
    
    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET);
    const db = mongoose.connection.db;
    
    const orders = await db.collection('orders').countDocuments();
    const products = await db.collection('products').countDocuments();
    const users = await db.collection('users').countDocuments();
    const revenueResult = await db.collection('orders').aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).toArray();
    
    res.json({
      orders,
      products,
      users,
      revenue: revenueResult[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Orders
router.get('/orders', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET);
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find().sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET);
    const { id } = req.params;
    const { status } = req.body;
    const db = mongoose.connection.db;
    
    await db.collection('orders').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Products
router.get('/products', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET);
    const db = mongoose.connection.db;
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Product
router.post('/products', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET);
    const { name, price, description, image, category, countInStock } = req.body;
    const db = mongoose.connection.db;
    
    const result = await db.collection('products').insertOne({
      name, price, description, image, category, countInStock,
      createdAt: new Date()
    });
    
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Product
router.delete('/products/:id', async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET);
    const db = mongoose.connection.db;
    await db.collection('products').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true });
});

module.exports = router;