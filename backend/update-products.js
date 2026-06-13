const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "iPhone 14 Pro",
    price: 1200000,
    description: "6.1-inch Super Retina XDR display, A16 Bionic chip, 48MP Main camera, Dynamic Island",
    image: "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-1.jpg",
    category: "Electronics",
    countInStock: 15
  },
  {
    name: "Samsung Galaxy S23 Ultra",
    price: 1150000,
    description: "6.8-inch Dynamic AMOLED 2X, 200MP camera, Snapdragon 8 Gen 2, S Pen included",
    image: "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-ultra-5g-1.jpg",
    category: "Electronics",
    countInStock: 12
  },
  {
    name: "MacBook Pro 14",
    price: 2350000,
    description: "Apple M2 Pro chip, 16GB RAM, 512GB SSD, 14-inch Liquid Retina XDR display",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202301?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1671304663229",
    category: "Computers",
    countInStock: 8
  },
  {
    name: "Sony WH-1000XM5",
    price: 350000,
    description: "Industry-leading noise canceling, 30-hour battery life, Premium sound quality",
    image: "https://m.media-amazon.com/images/I/61fJLHqrZXL._AC_SL1500_.jpg",
    category: "Audio",
    countInStock: 25
  },
  {
    name: "Apple Watch Series 8",
    price: 450000,
    description: "Always-On Retina display, Temperature sensing, Sleep stages, Crash Detection",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKU83_VW_34FR+watch-45-alum-midnight-nc-8s_VW_34FR_WF_CO?wid=750&hei=618&fmt=jpeg&qlt=90&.v=1684534911575",
    category: "Wearables",
    countInStock: 20
  },
  {
    name: "Nike Air Max 2023",
    price: 85000,
    description: "Nike Air Max with visible air cushioning, Breathable mesh upper, Durable rubber outsole",
    image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/6d27c1e9-a6bc-4af5-ad36-26b03f9b2e5c/air-max-2023-shoes-70r34C.png",
    category: "Footwear",
    countInStock: 40
  },
  {
    name: "iPad Pro 12.9",
    price: 950000,
    description: "12.9-inch Liquid Retina XDR display, M2 chip, Apple Pencil hover, Face ID",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210?wid=940&hei=1112&fmt=jpeg&qlt=90&.v=1664679100085",
    category: "Electronics",
    countInStock: 10
  },
  {
    name: "PlayStation 5",
    price: 520000,
    description: "DualSense wireless controller, Ultra-high speed SSD, 4K gaming, Ray tracing",
    image: "https://gmedia.playstation.com/is/image/SIEPDC/playstation-5-slim-with-vertical-stand-product-image-01-en-16sep23?$1600px$",
    category: "Gaming",
    countInStock: 5
  },
  {
    name: "Dell XPS 15",
    price: 1850000,
    description: "15.6-inch 3.5K OLED display, Intel Core i7, 32GB RAM, 1TB SSD, NVIDIA RTX 4060",
    image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps/notebook-xps-15-9530/media-gallery/wy1-gallery-1.psd?fmt=png-alpha",
    category: "Computers",
    countInStock: 7
  },
  {
    name: "JBL Flip 6",
    price: 120000,
    description: "Portable Bluetooth speaker, 12 hours of playtime, Waterproof IP67, PartyBoost",
    image: "https://media.s-bol.com/JRQyVQ8rYoP3/565x840.jpg",
    category: "Audio",
    countInStock: 30
  },
  {
    name: "Samsung 65-inch QLED 4K TV",
    price: 980000,
    description: "65-inch 4K Quantum HDR, 100% Color Volume, Quantum Dot technology, Smart TV",
    image: "https://images.samsung.com/is/image/samsung/p6pim/africa_fr/qa65qn85cauxen/gallery/africa-fr-uhd-tv-qa65qn85cauxen-534414211?$FB_TYPE_A_JPG$",
    category: "Electronics",
    countInStock: 3
  },
  {
    name: "HP Victus Gaming Laptop",
    price: 750000,
    description: "15.6-inch FHD 144Hz display, Intel Core i5, 16GB RAM, 512GB SSD, NVIDIA GTX 1650",
    image: "https://www.hp.com/content/dam/sites/worldwide/products/notebooks/gaming/pavilion-gaming-15/pavilion-gaming-15-laptop-ec2000-3.png",
    category: "Gaming",
    countInStock: 12
  }
];

const updateProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/kite_ecommerce');
    console.log('Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`✅ Added ${inserted.length} products to database`);
    
    console.log('\n📊 Product List:');
    inserted.forEach(product => {
      console.log(`  - ${product.name}: ₦${product.price.toLocaleString()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

updateProducts();