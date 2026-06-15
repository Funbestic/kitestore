// TEMPORARY SEED ENDPOINT - Remove after seeding
app.post('/api/seed', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = [
      {
        name: "iPhone 14 Pro",
        price: 1200000,
        description: "Latest Apple iPhone with amazing camera and battery life.",
        image: "https://images.unsplash.com/photo-1678652197883-481c1cae9f4e?w=400",
        category: "Electronics",
        countInStock: 10
      },
      {
        name: "Samsung Galaxy S23",
        price: 900000,
        description: "Premium Android smartphone with stunning display.",
        image: "https://images.unsplash.com/photo-1675847415216-52f71c7cd780?w=400",
        category: "Electronics",
        countInStock: 15
      },
      {
        name: "MacBook Pro",
        price: 2500000,
        description: "Powerful laptop for professionals.",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        category: "Computers",
        countInStock: 5
      }
    ];
    
    await Product.deleteMany();
    const inserted = await Product.insertMany(products);
    res.json({ message: `Seeded ${inserted.length} products` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});