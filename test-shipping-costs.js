const axios = require('axios');

// Test different weights and prefectures
const testCases = [
  { weight: 1.5, prefecture: '北海道', expectedCost: 800 },
  { weight: 3, prefecture: '北海道', expectedCost: 1200 },
  { weight: 6, prefecture: '北海道', expectedCost: 1500 },
  { weight: 1.5, prefecture: '東京都', expectedCost: 600 },
  { weight: 3, prefecture: '東京都', expectedCost: 900 },
  { weight: 6, prefecture: '東京都', expectedCost: 1200 },
  { weight: 1.5, prefecture: '大阪府', expectedCost: 650 },
  { weight: 3, prefecture: '大阪府', expectedCost: 950 },
  { weight: 6, prefecture: '大阪府', expectedCost: 1250 },
];

async function testShippingCosts() {
  console.log('Testing shipping cost calculations...');
  
  for (const testCase of testCases) {
    const { weight, prefecture, expectedCost } = testCase;
    
    try {
      const response = await axios.post('http://localhost:3000/api/shipping/calculate', {
        products: [{ productId: 'dummy', quantity: 1, weight }],
        prefecture
      });
      
      const actualCost = response.data.shippingCost;
      const passed = actualCost === expectedCost;
      
      console.log(`Test: ${weight}kg to ${prefecture} - Expected: ¥${expectedCost}, Actual: ¥${actualCost} - ${passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`Error testing ${weight}kg to ${prefecture}:`, error.message);
    }
  }
}

testShippingCosts();
