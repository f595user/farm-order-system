/**
 * Server-side fixes for 504 Gateway Timeout errors
 * This file contains middleware and configuration to prevent timeout issues
 */

const express = require('express');
const timeout = require('connect-timeout');
const compression = require('compression');
const mongoose = require('mongoose');

/**
 * Apply timeout fixes to an Express app
 * @param {Object} app - Express app instance
 * @param {Object} options - Configuration options
 */
function applyTimeoutFixes(app, options = {}) {
  const {
    timeoutDuration = '120s',
    mongooseTimeouts = {
      serverSelectionTimeoutMS: 30000,    // Increase from 5000 to 30000
      connectTimeoutMS: 30000,            // Increase from 10000 to 30000
      socketTimeoutMS: 90000,             // Increase from 45000 to 90000
    },
    enableCompression = true,
    enableResponseTimeLogging = true,
    enableRequestLogging = true,
  } = options;

  console.log('Applying server-side timeout fixes...');

  // 1. Apply timeout middleware to all routes
  app.use(timeout(timeoutDuration));
  app.use(haltOnTimedout);
  console.log(`- Applied timeout middleware with ${timeoutDuration} limit`);

  // 2. Apply compression to reduce response size and time
  if (enableCompression) {
    app.use(compression());
    console.log('- Applied compression middleware');
  }

  // 3. Add response time logging middleware
  if (enableResponseTimeLogging) {
    app.use((req, res, next) => {
      const startTime = Date.now();
      
      // Function to log response time when the response is finished
      const logResponseTime = () => {
        const duration = Date.now() - startTime;
        console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
        
        // Log warning for slow responses
        if (duration > 5000) {
          console.warn(`⚠️ Slow response detected: ${req.method} ${req.originalUrl} - ${duration}ms`);
        }
      };
      
      // Listen for response finish event
      res.on('finish', logResponseTime);
      
      next();
    });
    console.log('- Added response time logging middleware');
  }

  // 4. Add request logging middleware
  if (enableRequestLogging) {
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      next();
    });
    console.log('- Added request logging middleware');
  }

  // 5. Update Mongoose connection options
  updateMongooseTimeouts(mongooseTimeouts);

  console.log('Server-side timeout fixes applied successfully');
}

/**
 * Update Mongoose connection timeouts
 * @param {Object} timeouts - Mongoose timeout options
 */
function updateMongooseTimeouts(timeouts) {
  // Get the current Mongoose connection
  const connection = mongoose.connection;
  
  // If the connection is already established, update the options
  if (connection.readyState === 1) {
    console.log('Updating existing Mongoose connection timeouts:');
    console.log(JSON.stringify(timeouts, null, 2));
    
    // Apply new timeouts to the existing connection
    connection.db.admin().command({ 
      setParameter: 1, 
      socketTimeout: timeouts.socketTimeoutMS 
    }).catch(err => {
      console.error('Error updating MongoDB socket timeout:', err);
    });
  } else {
    // Update the default Mongoose connection options for future connections
    console.log('Setting default Mongoose connection timeouts:');
    console.log(JSON.stringify(timeouts, null, 2));
    
    mongoose.set('serverSelectionTimeoutMS', timeouts.serverSelectionTimeoutMS);
    mongoose.set('connectTimeoutMS', timeouts.connectTimeoutMS);
    mongoose.set('socketTimeoutMS', timeouts.socketTimeoutMS);
  }
}

/**
 * Middleware to halt request processing if the request has already timed out
 */
function haltOnTimedout(req, res, next) {
  if (!req.timedout) {
    next();
  } else {
    console.error(`Request timeout: ${req.method} ${req.originalUrl}`);
    // Don't call next() - let the timeout middleware handle the response
  }
}

/**
 * Apply query optimization to Mongoose
 * This adds indexes to commonly queried fields
 */
async function optimizeMongooseQueries() {
  console.log('Optimizing MongoDB queries...');
  
  try {
    // Get all models
    const models = mongoose.models;
    
    // Ensure indexes on commonly queried fields for each model
    for (const [modelName, model] of Object.entries(models)) {
      console.log(`- Checking indexes for ${modelName} model`);
      
      // Product model optimizations
      if (modelName === 'Product') {
        await model.collection.createIndex({ category: 1 });
        await model.collection.createIndex({ name: 'text', description: 'text' });
        await model.collection.createIndex({ stock: 1 });
        await model.collection.createIndex({ status: 1 });
        console.log('  - Created indexes for Product model');
      }
      
      // Order model optimizations
      if (modelName === 'Order') {
        await model.collection.createIndex({ user: 1 });
        await model.collection.createIndex({ status: 1 });
        await model.collection.createIndex({ paymentStatus: 1 });
        await model.collection.createIndex({ createdAt: -1 });
        console.log('  - Created indexes for Order model');
      }
      
      // User model optimizations
      if (modelName === 'User') {
        await model.collection.createIndex({ email: 1 }, { unique: true });
        await model.collection.createIndex({ role: 1 });
        console.log('  - Created indexes for User model');
      }
    }
    
    console.log('MongoDB query optimization completed successfully');
  } catch (error) {
    console.error('Error optimizing MongoDB queries:', error);
  }
}

/**
 * Apply database connection pooling optimization
 */
function optimizeDatabaseConnectionPool() {
  console.log('Optimizing database connection pool...');
  
  // Set MongoDB connection pool size
  const poolSize = process.env.MONGODB_POOL_SIZE || 10;
  mongoose.set('maxPoolSize', poolSize);
  
  console.log(`- Set MongoDB connection pool size to ${poolSize}`);
  console.log('Database connection pool optimization completed');
}

/**
 * Apply all server-side optimizations
 * @param {Object} app - Express app instance
 * @param {Object} options - Configuration options
 */
async function applyAllOptimizations(app, options = {}) {
  // Apply timeout fixes
  applyTimeoutFixes(app, options);
  
  // Optimize database connection pool
  optimizeDatabaseConnectionPool();
  
  // Optimize MongoDB queries (add indexes)
  await optimizeMongooseQueries();
  
  console.log('All server-side optimizations applied successfully');
}

module.exports = {
  applyTimeoutFixes,
  applyAllOptimizations,
  optimizeMongooseQueries,
  optimizeDatabaseConnectionPool,
  updateMongooseTimeouts
};
