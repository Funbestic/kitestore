const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://admirable-heliotrope-b455e3.netlify.app',
  'https://kitestore.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// TEMPORARY SEED ENDPOINT
app.post('/api/seed', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = [
      { name: "iPhone 14 Pro", price: 1200000, description: "Latest Apple iPhone", image: "https://images.unsplash.com/photo-1678652197883-481c1cae9f4e?w=400", category: "Electronics", countInStock: 10 },
      { name: "Samsung Galaxy S23", price: 900000, description: "Premium Android", image: "https://images.unsplash.com/photo-1675847415216-52f71c7cd780?w=400", category: "Electronics", countInStock: 15 },
      { name: "MacBook Pro", price: 2500000, description: "Powerful laptop", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", category: "Computers", countInStock: 5 },
      { name: "Sony WH-1000XM5", price: 350000, description: "Noise-canceling headphones", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", category: "Audio", countInStock: 20 },
      { name: "Apple Watch Series 8", price: 450000, description: "Health tracking", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400", category: "Wearables", countInStock: 8 },
      { name: "Nike Air Max", price: 85000, description: "Comfortable sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", category: "Footwear", countInStock: 30 }
    ];
    
    await Product.deleteMany();
    const inserted = await Product.insertMany(products);
    res.json({ message: `✅ Seeded ${inserted.length} products` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TEST - Direct database query (add this before app.listen)
app.get('/api/direct-products', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    console.log(`Direct query found ${products.length} products`);
    res.json({ count: products.length, products });
  } catch (err) {
    console.error('Direct query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Kite API is running...' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kite_ecommerce';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Direct products: http://localhost:${PORT}/api/direct-products`);
  console.log(`Products API: http://localhost:${PORT}/api/products`);
  console.log(`Seed endpoint: POST http://localhost:${PORT}/api/seed`);
});