const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  { name: 'iPhone 14 Pro', price: 1200000, description: 'Latest Apple iPhone', image: 'https://images.unsplash.com/photo-1678652197883-481c1cae9f4e?w=400', category: 'Electronics', countInStock: 10 },
  { name: 'Samsung Galaxy S23', price: 900000, description: 'Premium Android', image: 'https://images.unsplash.com/photo-1675847415216-52f71c7cd780?w=400', category: 'Electronics', countInStock: 15 },
  { name: 'MacBook Pro', price: 2500000, description: 'Powerful laptop', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', category: 'Computers', countInStock: 5 },
  { name: 'Sony WH-1000XM5', price: 350000, description: 'Noise-canceling headphones', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category: 'Audio', countInStock: 20 },
  { name: 'Apple Watch Series 8', price: 450000, description: 'Health tracking', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', category: 'Wearables', countInStock: 8 },
  { name: 'Nike Air Max', price: 85000, description: 'Comfortable sneakers', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Footwear', countInStock: 30 }
];

const MONGODB_URI = 'mongodb+srv://kitestore_user:YourStrongPassword123!@ecommerce1.remd1dz.mongodb.net/Ecommerce1?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    await Product.deleteMany();
    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products to Atlas!`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
