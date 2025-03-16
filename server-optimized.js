require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const timeout = require('connect-timeout');

// Import timeout fixes
const { applyAllOptimizations } = require('./server-timeout-fix');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' })); // Increase JSON payload limit
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded payload limit

// Apply timeout middleware early in the middleware chain
app.use(timeout('120s')); // 2-minute timeout
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Serve static files with caching
// Serve React build files first (for SPA)
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true,
  lastModified: true
}));

// Then serve legacy public files (for backward compatibility)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Compression middleware to reduce response size
app.use(compression());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'farm-order-secret',
  resave: false,
  saveUninitialized: true, // Changed to true to create session for all requests
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_order_system',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    sameSite: 'lax', // Add SameSite attribute to prevent third-party cookie issues
    httpOnly: true, // Enhance security by making cookies inaccessible to JavaScript
    path: '/' // Ensure cookie is available for all paths
  }
}));

// Passport configuration
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Database connection with improved timeout settings
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_order_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increased from 5000 to 30000
  connectTimeoutMS: 30000, // Increased from 10000 to 30000
  socketTimeoutMS: 90000, // Increased from 45000 to 90000
  maxPoolSize: 10, // Set connection pool size
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please make sure MongoDB is running and accessible at:', process.env.MONGODB_URI || 'mongodb://localhost:27017/farm_order_system');
  process.exit(1); // Exit with failure
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Handle MongoDB disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

// Handle MongoDB reconnection
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// Response time logging middleware
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

// Routes

// API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
  // Exclude API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

// Apply all optimizations after routes are defined
(async () => {
  try {
    await applyAllOptimizations(app, {
      timeoutDuration: '120s',
      mongooseTimeouts: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 90000,
      },
      enableCompression: true,
      enableResponseTimeLogging: true,
      enableRequestLogging: true,
    });
    
    // Start server after optimizations are applied
    app.listen(PORT, () => {
      console.log(`Optimized server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error applying optimizations:', error);
    
    // Start server even if optimizations fail
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without optimizations)`);
    });
  }
})();
