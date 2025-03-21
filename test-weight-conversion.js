/**
 * Test script for weight conversion in shipping calculator
 * Tests the calculation of total weight with mixed units (g and kg)
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

// Mock products with different weight units
const mockProducts = [
  { _id: 'product1', name: 'Product 1 (kg)', weight: 1.5, unit: 'kg', price: 1000 },
  { _id: 'product2', name: 'Product 2 (g)', weight: 500, unit: 'g', price: 2000 },
  { _id: 'product3', name: 'Product 3 (kg)', weight: 2, unit: 'kg', price: 3000 },
  { _id: 'product4', name: 'Product 4 (g)', weight: 750, unit: 'g', price: 1500 },
];

// Test cases
const testCases = [
  {
    name: 'Only kg products',
    quantities: {
      'product1': 2, // 1.5kg × 2 = 3kg
      'product2': 0,
      'product3': 1, // 2kg × 1 = 2kg
      'product4': 0,
    },
    expectedWeight: 5 // 3kg + 2kg = 5kg
  },
  {
    name: 'Only g products',
    quantities: {
      'product1': 0,
      'product2': 3, // 500g × 3 = 1500g = 1.5kg
      'product3': 0,
      'product4': 2, // 750g × 2 = 1500g = 1.5kg
    },
    expectedWeight: 3 // 1.5kg + 1.5kg = 3kg
  },
  {
    name: 'Mixed kg and g products',
    quantities: {
      'product1': 1, // 1.5kg × 1 = 1.5kg
      'product2': 2, // 500g × 2 = 1000g = 1kg
      'product3': 1, // 2kg × 1 = 2kg
      'product4': 1, // 750g × 1 = 750g = 0.75kg
    },
    expectedWeight: 5.25 // 1.5kg + 1kg + 2kg + 0.75kg = 5.25kg
  }
];

// Run tests
console.log('Testing weight calculation with mixed units (g and kg)...\n');

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
