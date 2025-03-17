// In newer versions of Node.js, we need to use the import syntax for node-fetch
// But for compatibility, we'll use dynamic import
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test data for creating an order
const orderData = {
  items: [
    {
      product: "67c5ae6b1981923d2154f348", // Actual product ID from the database
      quantity: 2,
      shippingAddress: {
        name: "Test User",
        phone: "123-456-7890",
        address: "123 Test Street",
        city: "Test City",
        postalCode: "123-4567"
      }
    }
  ],
  paymentMethod: "credit_card" // This should trigger our mock payment processing
};

// Function to test the order creation
async function testOrderCreation() {
  try {
    console.log('Testing order creation with mock payment processing...');
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log('Order details:', JSON.stringify(data, null, 2));
      console.log('Our fix for the payment processing is working correctly.');
    } else {
      console.error('❌ Failed to create order:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing order creation:', error.message);
  }
}

// Run the test
testOrderCreation();
