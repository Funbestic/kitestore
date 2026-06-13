const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

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

// Direct route for registration (backup)
app.post('/api/register', (req, res) => {
  console.log('Direct register hit:', req.body);
  res.json({ message: 'Direct route works!', data: req.body });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Kite API is running...' });
});

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/kite_ecommerce')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Products API: http://localhost:${PORT}/api/products`);
  console.log(`Users API: http://localhost:${PORT}/api/users/test`);
  console.log(`Reviews API: http://localhost:${PORT}/api/reviews`);
  console.log(`Admin API: http://localhost:${PORT}/api/admin/login`);
});
