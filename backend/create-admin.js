const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/kite_ecommerce')
  .then(async () => {
    const db = mongoose.connection.db;
    const collection = db.collection('admins');
    
    // Delete existing
    await collection.deleteMany({ email: 'admin@admin.com' });
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin
    await collection.insertOne({
      name: 'Super Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('✅ Admin user created!');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123');
    process.exit(0);
  });
