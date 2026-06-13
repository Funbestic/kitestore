

// backend/seed.js
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "iPhone 14 Pro",
    price: 1200000,
    description: "Latest Apple iPhone with amazing camera and battery life. Features Dynamic Island, A16 Bionic chip, and 48MP main camera.",
    image: "https://images.unsplash.com/photo-1678652197883-481c1cae9f4e?w=400",
    category: "Electronics",
    countInStock: 10
  },
  {
    name: "Samsung Galaxy S23",
    price: 900000,
    description: "Premium Android smartphone with stunning 120Hz display, Snapdragon 8 Gen 2, and 50MP camera.",
    image: "https://images.unsplash.com/photo-1675847415216-52f71c7cd780?w=400",
    category: "Electronics",
    countInStock: 15
  },
  {
    name: "MacBook Pro",
    price: 2500000,
    description: "Powerful laptop for professionals with M2 Pro chip, 16GB RAM, and stunning Retina display.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    category: "Computers",
    countInStock: 5
  },
  {
    name: "Sony WH-1000XM5",
    price: 350000,
    description: "Premium noise-canceling headphones with exceptional sound quality and 30-hour battery life.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
    category: "Audio",
    countInStock: 20
  },
  {
    name: "Apple Watch Series 8",
    price: 450000,
    description: "Advanced health and fitness features, always-on Retina display, and crash detection.",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
    category: "Wearables",
    countInStock: 8
  },
  {
    name: "Nike Air Max",
    price: 85000,
    description: "Comfortable and stylish sneakers with Air cushioning technology.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "Footwear",
    countInStock: 30
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kite_ecommerce');
    
    // Clear existing products (optional)
    await Product.deleteMany();
    console.log('Cleared existing products');
    
    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Added ${insertedProducts.length} products to database`);
    
    console.log('\n📊 Product List:');
    insertedProducts.forEach(product => {
      console.log(`  - ${product.name}: ₦${product.price.toLocaleString()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();