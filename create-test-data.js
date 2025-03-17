/**
 * Test data creation script for the farm order system
 * This script creates a test user and some test orders
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test user data
const testUser = {
  name: 'テストユーザー',
  email: 'test@example.com',
  password: 'password123',
  addresses: [
    {
      name: 'テストユーザー',
      phone: '090-1234-5678',
      postalCode: '123-4567',
      city: '東京都',
      address: '渋谷区渋谷1-1-1',
      isDefault: true
    }
  ]
};

// Create test data
async function createTestData() {
  try {
    // Check if test user already exists
    let user = await User.findOne({ email: testUser.email });
    
    if (!user) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testUser.password, salt);
      
      // Create user
      user = await User.create({
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
        addresses: testUser.addresses
      });
      
      console.log('Test user created:', user.email);
    } else {
      console.log('Test user already exists:', user.email);
    }
    
    // Get some products for orders
    const products = await Product.find().limit(3);
    
    if (products.length === 0) {
      console.log('No products found. Please create some products first.');
      return;
    }
    
    // Create test orders with different statuses
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['credit_card', 'bank_transfer', 'cash_on_delivery'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    // Delete existing orders for test user
    await Order.deleteMany({ user: user._id });
    
    // Create 5 orders with different statuses
    for (let i = 0; i < 5; i++) {
      const status = orderStatuses[i];
      const paymentMethod = paymentMethods[i % paymentMethods.length];
      const paymentStatus = status === 'cancelled' ? 'refunded' : 
                           (status === 'delivered' || status === 'shipped') ? 'paid' : 
                           paymentStatuses[i % paymentStatuses.length];
      
      // Create random items from available products
      const items = products.map(product => ({
        product: product._id,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: product.price,
        shippingAddress: testUser.addresses[0]
      }));
      
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order with date offset (older to newer)
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - (5 - i) * 3); // Each order 3 days apart
      
      const order = await Order.create({
        user: user._id,
        items,
        totalAmount,
        paymentMethod,
        paymentStatus,
        status,
        createdAt,
        updatedAt: createdAt
      });
      
      console.log(`Test order created: ${order._id} (${status})`);
    }
    
    console.log('Test data creation completed');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the function
createTestData();
