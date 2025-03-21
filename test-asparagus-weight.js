/**
 * Test script for asparagus weight calculation
 * Tests the calculation of total weight for asparagus products with different units
 */

// Implement the calculateTotalWeight function directly in the test
// This is the same implementation as in src/utils/shippingCalculator.js
const calculateTotalWeight = (products, quantities) => {
  return Object.entries(quantities).reduce((total, [productId, quantity]) => {
    if (quantity <= 0) return total;
    
    const product = products.find(p => p._id === productId);
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

// Mock asparagus products with different weights and units
const mockProducts = [
  { _id: 'asparagus500g', name: 'アスパラ 500g', weight: 500, unit: 'g', price: 1000 },
  { _id: 'asparagus1kg', name: 'アスパラ 1kg', weight: 1, unit: 'kg', price: 2000 },
];

// Test cases
const testCases = [
  {
    name: '500g asparagus',
    quantities: {
      'asparagus500g': 1, // 500g × 1 = 500g = 0.5kg
      'asparagus1kg': 0,
    },
    expectedWeight: 0.5 // 0.5kg
  },
  {
    name: '1kg asparagus',
    quantities: {
      'asparagus500g': 0,
      'asparagus1kg': 1, // 1kg × 1 = 1kg
    },
    expectedWeight: 1 // 1kg
  },
  {
    name: 'Both asparagus products',
    quantities: {
      'asparagus500g': 1, // 500g × 1 = 500g = 0.5kg
      'asparagus1kg': 1, // 1kg × 1 = 1kg
    },
    expectedWeight: 1.5 // 0.5kg + 1kg = 1.5kg
  }
];

// Run tests
console.log('Testing asparagus weight calculation...\n');

testCases.forEach(testCase => {
  console.log(`Test case: ${testCase.name}`);
  
  // Calculate total weight
  const totalWeight = calculateTotalWeight(mockProducts, testCase.quantities);
  
  // Check if the result matches the expected weight
  const passed = Math.abs(totalWeight - testCase.expectedWeight) < 0.001; // Allow small floating point differences
  
  console.log(`Expected weight: ${testCase.expectedWeight}kg`);
  console.log(`Actual weight: ${totalWeight}kg`);
  console.log(`Result: ${passed ? 'PASSED' : 'FAILED'}`);
  console.log('-----------------------------------');
});

// Summary
console.log('\nTest completed.');
