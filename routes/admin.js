const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { ensureAdmin } = require('../middleware/auth');

// All routes in this file are protected by the ensureAdmin middleware
router.use(ensureAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    
    // Get low stock products
    const products = await Product.find();
    const lowStockProducts = products.filter(product => product.stock <= product.lowStockThreshold);
    
    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Calculate total revenue
    const orders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    res.json({
      orderStats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        totalRevenue
      },
      productStats: {
        totalProducts,
        outOfStockProducts,
        lowStockCount: lowStockProducts.length
      },
      userStats: {
        totalUsers,
        totalAdmins
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering options
// @access  Private (Admin only)
router.get('/orders', async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, search } = req.query;
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by payment status if provided
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // If search term is provided, find users matching the term
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
      
      const userIds = users.map(user => user._id);
      
      if (userIds.length > 0) {
        query.user = { $in: userIds };
      } else {
        // If no users match, search by order ID if the search term looks like an ID
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
          query._id = search;
        } else {
          // If no users match and the search term doesn't look like an ID,
          // return empty results
          return res.json([]);
        }
      }
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/admin/reports/sales
// @desc    Get sales report
// @access  Private (Admin only)
router.get('/reports/sales', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    let start, end;
    const now = new Date();
    
    // Set date range based on period
    if (period === 'daily') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      end = now;
    } else if (period === 'weekly') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
      end = now;
    } else if (period === 'monthly') {
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      end = now;
    } else if (period === 'yearly') {
      start = new Date(now.getFullYear() - 5, 0, 1);
      end = now;
    } else if (startDate && endDate) {
      // Custom date range
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      end = now;
    }
    
    // Get all paid orders within the date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: 'paid'
    }).sort({ createdAt: 1 });
    
    // Group orders by date
    const salesByDate = {};
    
    orders.forEach(order => {
      let dateKey;
      const date = new Date(order.createdAt);
      
      if (period === 'daily') {
        dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      } else if (period === 'weekly') {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        dateKey = `${date.getFullYear()}-W${weekNumber}`;
      } else if (period === 'monthly') {
        dateKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else if (period === 'yearly') {
        dateKey = `${date.getFullYear()}`;
      } else {
        // Custom or default (daily)
        dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }
      
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = {
          date: dateKey,
          revenue: 0,
          orderCount: 0
        };
      }
      
      salesByDate[dateKey].revenue += order.totalAmount;
      salesByDate[dateKey].orderCount += 1;
    });
    
    // Convert to array and sort by date
    const salesData = Object.values(salesByDate).sort((a, b) => {
      return a.date.localeCompare(b.date);
    });
    
    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    
    res.json({
      salesData,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ message: 'Server error while generating sales report' });
  }
});

// @route   GET /api/admin/reports/products
// @desc    Get product performance report
// @access  Private (Admin only)
router.get('/reports/products', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    const now = new Date();
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      end = now;
    }
    
    // Get all orders within the date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    }).populate('items.product', 'name price category');
    
    // Group by product
    const productPerformance = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!item.product) return; // Skip if product reference is missing
        
        const productId = item.product._id.toString();
        
        if (!productPerformance[productId]) {
          productPerformance[productId] = {
            productId,
            name: item.product.name,
            category: item.product.category,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        
        productPerformance[productId].totalQuantity += item.quantity;
        productPerformance[productId].totalRevenue += item.price * item.quantity;
        productPerformance[productId].orderCount += 1;
      });
    });
    
    // Convert to array and sort by revenue
    const productData = Object.values(productPerformance).sort((a, b) => {
      return b.totalRevenue - a.totalRevenue;
    });
    
    res.json({
      productData,
      dateRange: {
        start,
        end
      }
    });
  } catch (error) {
    console.error('Product report error:', error);
    res.status(500).json({ message: 'Server error while generating product report' });
  }
});

module.exports = router;
