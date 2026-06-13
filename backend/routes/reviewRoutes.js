const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    console.log('Getting reviews for product:', req.params.productId);
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add review for a product
router.post('/', async (req, res) => {
  try {
    console.log('Adding review:', req.body);
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get average rating for a product
router.get('/product/:productId/average', async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(req.params.productId) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
    
    res.json({
      averageRating: result[0]?.averageRating || 0,
      totalReviews: result[0]?.totalReviews || 0
    });
  } catch (error) {
    console.error('Error getting average:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;