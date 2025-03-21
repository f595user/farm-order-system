/**
 * Test script to verify the updated product weights
 * This script simulates adding products to the cart and calculating the total weight
 */

const mongoose = require('mongoose');
const Product = require('./models/Product');

// Implement the calculateTotalWeight function directly in the test
// This is the same implementation as in src/utils/shippingCalculator.js
const calculateTotalWeight = (products, quantities) => {
  return Object.entries(quantities).reduce((total, [productId, quantity]) => {
    if (quantity <= 0) return total;
    
    const product = products.find(p => p._id.toString() === productId);
    if (!product) return total;
    
    // 単位に基づいて重量を kg に変換
    let weightInKg;
    if (product.unit === 'g') {
      weightInKg = product.weight / 1000; // g から kg への変換
      console.log(`Converting ${product.weight}g to ${weightInKg}kg for product ${product.name || productId}`);
    } else {
      weightInKg = product.weight; // すでに kg の場合
      console.log(`Using weight ${weightInKg}kg for product ${product.name || productId}`);
    }
    
    return total + (weightInKg * quantity);
  }, 0);
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_order_system')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get the asparagus products
      const asparagus1kg = await Product.findOne({ unit: '1kg', category: 'アスパラ' });
      const asparagus500g = await Product.findOne({ unit: '500g', category: 'アスパラ' });
      
      if (!asparagus1kg || !asparagus500g) {
        console.error('Could not find asparagus products');
        return;
      }
      
      console.log('Found asparagus products:');
      console.log(`- 1kg: ${asparagus1kg.name}, weight: ${asparagus1kg.weight}kg, unit: ${asparagus1kg.unit}`);
      console.log(`- 500g: ${asparagus500g.name}, weight: ${asparagus500g.weight}kg, unit: ${asparagus500g.unit}`);
      
      // Test cases
      const testCases = [
        {
          name: 'Only 500g asparagus',
          quantities: {
            [asparagus500g._id.toString()]: 1, // 500g × 1 = 500g = 0.5kg
            [asparagus1kg._id.toString()]: 0,
          },
          expectedWeight: 0.5 // 0.5kg
        },
        {
          name: 'Only 1kg asparagus',
          quantities: {
            [asparagus500g._id.toString()]: 0,
            [asparagus1kg._id.toString()]: 1, // 1kg × 1 = 1kg
          },
          expectedWeight: 1 // 1kg
        },
        {
          name: 'Both asparagus products',
          quantities: {
            [asparagus500g._id.toString()]: 1, // 500g × 1 = 500g = 0.5kg
            [asparagus1kg._id.toString()]: 1, // 1kg × 1 = 1kg
          },
          expectedWeight: 1.5 // 0.5kg + 1kg = 1.5kg
        },
        {
          name: 'Multiple quantities',
          quantities: {
            [asparagus500g._id.toString()]: 2, // 500g × 2 = 1000g = 1kg
            [asparagus1kg._id.toString()]: 3, // 1kg × 3 = 3kg
          },
          expectedWeight: 4 // 1kg + 3kg = 4kg
        }
      ];
      
      // Run tests
      console.log('\nTesting weight calculation with updated product weights...\n');
      
      const products = [asparagus500g, asparagus1kg];
      
      for (const testCase of testCases) {
        console.log(`Test case: ${testCase.name}`);
        
        // Calculate total weight
        const totalWeight = calculateTotalWeight(products, testCase.quantities);
        
        // Check if the result matches the expected weight
        const passed = Math.abs(totalWeight - testCase.expectedWeight) < 0.001; // Allow small floating point differences
        
        console.log(`Expected weight: ${testCase.expectedWeight}kg`);
        console.log(`Actual weight: ${totalWeight}kg`);
        console.log(`Result: ${passed ? 'PASSED' : 'FAILED'}`);
        console.log('-----------------------------------');
      }
      
      console.log('\nTest completed.');
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
