/**
 * Script to update existing products with weight information
 * This is needed after adding the weight field to the Product model
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import Product model
const Product = require('./models/Product');

// Default weights by category (in kg)
const defaultWeights = {
  'アスパラ': 1.5,  // Asparagus typically weighs around 1.5kg per bundle
  'はちみつ': 0.5   // Honey typically weighs around 0.5kg per jar
};

async function updateProductWeights() {
  try {
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);
    
    // Update each product with a weight based on category
    for (const product of products) {
      const categoryWeight = defaultWeights[product.category] || 1;
      
      // Update the weight based on category
      const oldWeight = product.weight;
      product.weight = categoryWeight;
      await product.save();
      
      console.log(`Updated product "${product.name}" weight: ${oldWeight}kg -> ${categoryWeight}kg`);
    }
    
    console.log('All products updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
}

// Run the update function
updateProductWeights();
