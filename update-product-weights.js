/**
 * Script to update product weights to match their units
 * This script corrects the weight values for products with 'g' and 'kg' units
 */

const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_order_system')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get all products
      const products = await Product.find({});
      console.log(`Found ${products.length} products`);
      
      // Update each product's weight based on its unit
      for (const product of products) {
        console.log(`Processing product: ${product.name} (${product._id})`);
        console.log(`Current weight: ${product.weight}, unit: ${product.unit}`);
        
        let newWeight = product.weight;
        let needsUpdate = false;
        
        // Check if unit contains 'g' (gram) but not 'kg'
        if (product.unit.includes('g') && !product.unit.includes('kg')) {
          // Extract the numeric part from the unit (e.g., "500g" -> 500)
          const unitValue = parseInt(product.unit.replace(/[^0-9]/g, ''), 10);
          
          if (!isNaN(unitValue)) {
            // Set weight to match the unit value in kg
            newWeight = unitValue / 1000;
            needsUpdate = true;
            console.log(`Updating weight for ${product.unit} product to ${newWeight}kg`);
          }
        } 
        // Check if unit contains 'kg'
        else if (product.unit.includes('kg')) {
          // Extract the numeric part from the unit (e.g., "1kg" -> 1)
          const unitValue = parseFloat(product.unit.replace(/[^0-9.]/g, ''));
          
          if (!isNaN(unitValue)) {
            // Set weight to match the unit value
            newWeight = unitValue;
            needsUpdate = true;
            console.log(`Updating weight for ${product.unit} product to ${newWeight}kg`);
          }
        }
        
        // Update the product if needed
        if (needsUpdate) {
          await Product.updateOne({ _id: product._id }, { weight: newWeight });
          console.log(`Updated weight for ${product.name} from ${product.weight} to ${newWeight}`);
        } else {
          console.log(`No update needed for ${product.name}`);
        }
      }
      
      console.log('Weight update completed');
    } catch (error) {
      console.error('Error updating product weights:', error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
