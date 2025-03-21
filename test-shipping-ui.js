// Test script to verify shipping cost calculation and display in the UI
const { calculateShippingCost } = require('./utils/shippingCalculator');

// Mock products and destinations
const mockProducts = [
  { _id: 'product1', name: 'Product 1', price: 1000, weight: 1.5 },
  { _id: 'product2', name: 'Product 2', price: 2000, weight: 2.5 },
  { _id: 'product3', name: 'Product 3', price: 3000, weight: 3.5 },
];

const mockDestination = {
  id: 1,
  name: 'Test User',
  phone: '123-456-7890',
  postalCode: '123-4567',
  city: '東京都',
  address: 'Test Address',
  products: {
    'product1': 2,
    'product2': 1,
    'product3': 0,
  }
};

// Calculate total weight
const calculateTotalWeight = (products, quantities) => {
  return Object.entries(quantities).reduce((total, [productId, quantity]) => {
    if (quantity <= 0) return total;
    
    const product = products.find(p => p._id === productId);
    if (!product) return total;
    
    return total + (product.weight * quantity);
  }, 0);
};

// Test shipping cost calculation
async function testShippingCostCalculation() {
  console.log('Testing shipping cost calculation and display...');
  
  try {
    // Calculate total weight
    const totalWeight = calculateTotalWeight(mockProducts, mockDestination.products);
    console.log(`Total weight: ${totalWeight}kg`);
    
    // Calculate shipping cost
    const shippingCost = await calculateShippingCost(totalWeight, mockDestination.city);
    console.log(`Calculated shipping cost: ¥${shippingCost}`);
    
    // Simulate the UI display
    const validCost = typeof shippingCost === 'number' && !isNaN(shippingCost) ? shippingCost : 500;
    console.log(`Shipping cost to display in UI: ¥${validCost}`);
    
    // Check if the shipping cost is the expected value
    const expectedCost = 1200; // Expected cost for 5.5kg to 東京都 (using 10kg rate since it's > 5kg)
    console.log(`Expected shipping cost: ¥${expectedCost}`);
    console.log(`Test result: ${validCost === expectedCost ? 'PASSED' : 'FAILED'}`);
    
    // Return the shipping cost for further testing
    return validCost;
  } catch (error) {
    console.error('Error in test:', error);
    return 500; // Default shipping cost on error
  }
}

// Run the test
testShippingCostCalculation().then(cost => {
  console.log(`Final shipping cost: ¥${cost}`);
});
