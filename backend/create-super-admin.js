

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/kite_ecommerce')
  .then(async () => {
    const db = mongoose.connection.db;
    const admins = db.collection('admins');
    
    const existing = await admins.findOne({ email: 'super@kitestore.com' });
    if (existing) {
      console.log('Super admin already exists');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('SuperAdmin123', 10);
    
    await admins.insertOne({
      name: 'Super Admin',
      email: 'super@kitestore.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: {
        manageProducts: true,
        manageOrders: true,
        manageUsers: true,
        manageAdmins: true
      },
      isActive: true,
      createdAt: new Date()
    });
    
    console.log('✅ Super Admin created!');
    console.log('Email: super@kitestore.com');
    console.log('Password: SuperAdmin123');
    process.exit(0);
  })
  .catch(err => console.error(err));