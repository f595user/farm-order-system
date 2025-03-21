const express = require('express');
const router = express.Router();
const { calculateShippingCost, getAllShippingRates } = require('../utils/shippingCalculator');
const Product = require('../models/Product');

/**
 * @route   GET /api/shipping/rates
 * @desc    Get all shipping rates
 * @access  Public
 */
router.get('/rates', async (req, res) => {
  try {
    const rates = await getAllShippingRates();
    res.json(rates);
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

/**
 * @route   POST /api/shipping/calculate
 * @desc    Calculate shipping cost based on products and destination
 * @access  Public
 */
router.post('/calculate', async (req, res) => {
  try {
    console.log('[API] Received shipping calculation request:', req.body);
    const { products, prefecture } = req.body;

    if (!products || !Array.isArray(products) || !prefecture) {
      console.log('[API] Invalid request - missing products or prefecture');
      return res.status(400).json({ message: '商品情報と配送先都道府県が必要です。' });
    }

    // Calculate total weight
    let totalWeight = 0;
    
    for (const item of products) {
      const { productId, quantity, weight } = item;
      console.log('[API] Processing item:', item);
      
      // If weight is directly provided, use it
      if (weight && quantity) {
        console.log(`[API] Using provided weight: ${weight}kg x ${quantity}`);
        totalWeight += weight * quantity;
        continue;
      }
      
      if (!productId || !quantity || quantity <= 0) {
        console.log('[API] Skipping item - invalid productId or quantity');
        continue;
      }
      
      // Get product from database
      const product = await Product.findById(productId);
      
      if (!product) {
        console.log(`[API] Product not found: ${productId}`);
        continue;
      }
      
      // Convert weight to kg if unit is 'g'
      let weightInKg = product.weight;
      if (product.unit === 'g') {
        weightInKg = product.weight / 1000;
        console.log(`[API] Converting ${product.weight}g to ${weightInKg}kg for product ${product.name}`);
      }
      
      console.log(`[API] Product ${product.name} weight: ${weightInKg}kg (original: ${product.weight}${product.unit}) x ${quantity}`);
      totalWeight += weightInKg * quantity;
    }
    
    console.log(`[API] Total weight: ${totalWeight}kg, Prefecture: ${prefecture}`);
    
    // Calculate shipping cost
    const shippingCost = await calculateShippingCost(totalWeight, prefecture);
    console.log(`[API] Calculated shipping cost: ${shippingCost}`);
    
    const response = {
      totalWeight,
      prefecture,
      shippingCost
    };
    console.log('[API] Sending response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;
