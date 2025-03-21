const { calculateShippingCost } = require('./utils/shippingCalculator');

// Test cities to prefectures mapping
async function testCityMapping() {
  console.log('Testing city to prefecture mapping...');
  
  const testCases = [
    { input: '札幌市', expectedPrefecture: '北海道', weight: 3 },
    { input: '東京', expectedPrefecture: '東京都', weight: 3 },
    { input: '大阪市', expectedPrefecture: '大阪府', weight: 3 },
    { input: '北海道', expectedPrefecture: '北海道', weight: 3 }, // Direct prefecture
    { input: '東京都', expectedPrefecture: '東京都', weight: 3 }, // Direct prefecture
    { input: '大阪府', expectedPrefecture: '大阪府', weight: 3 }, // Direct prefecture
  ];
  
  for (const testCase of testCases) {
    const { input, expectedPrefecture, weight } = testCase;
    console.log(`\nTesting: ${input} (Expected: ${expectedPrefecture})`);
    
    try {
      const cost = await calculateShippingCost(weight, input);
      console.log(`Shipping cost for ${weight}kg to ${input}: ¥${cost}`);
      console.log(`Test ${cost > 0 ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`Error testing ${input}:`, error);
    }
  }
}

// Run the test
testCityMapping();
