const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { ensureAuthenticated, ensureAdmin, ensureOwnerOrAdmin } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      
      if (product.status !== '販売中' || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${product.name} is not available in the requested quantity`
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        shippingAddress: item.shippingAddress
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Create order
    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      status: 'pending'
    });
    
    // Process payment if not cash on delivery
    if (paymentMethod === 'credit_card') {
      // In a real application, you would integrate with Stripe or another payment processor here
      // This is a simplified example
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100), // Stripe requires amount in cents
          currency: 'jpy',
          description: `Order ${newOrder._id}`,
          metadata: {
            orderId: newOrder._id.toString()
          }
        });
        
        newOrder.paymentDetails = {
          transactionId: paymentIntent.id,
          paymentDate: new Date()
        };
        
        // In a real application, you would confirm the payment here
        // For this example, we'll assume it's successful
        newOrder.paymentStatus = 'paid';
      } catch (error) {
        console.error('Payment processing error:', error);
        return res.status(500).json({ message: 'Payment processing failed' });
      }
    }
    
    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (admin) or user's orders (customer)
// @access  Private
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'admin') {
      // Admin can see all orders
      orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });
    } else {
      // Customers can only see their own orders
      orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (owner or admin)
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (admin only)
router.put('/:id/status', ensureAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private (admin only)
router.put('/:id/payment', ensureAdmin, async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({ message: 'Payment status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.paymentStatus = paymentStatus;
    
    if (transactionId) {
      order.paymentDetails = {
        ...order.paymentDetails,
        transactionId,
        paymentDate: new Date()
      };
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error while updating payment status' });
  }
});

// @route   PUT /api/orders/:id/shipping
// @desc    Update shipping details
// @access  Private (admin only)
router.put('/:id/shipping', ensureAdmin, async (req, res) => {
  try {
    const { carrier, trackingNumber, estimatedDelivery } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.shippingDetails = {
      carrier: carrier || order.shippingDetails?.carrier,
      trackingNumber: trackingNumber || order.shippingDetails?.trackingNumber,
      estimatedDelivery: estimatedDelivery || order.shippingDetails?.estimatedDelivery
    };
    
    // Update status to shipped if tracking number is provided
    if (trackingNumber && order.status === 'processing') {
      order.status = 'shipped';
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Update shipping details error:', error);
    res.status(500).json({ message: 'Server error while updating shipping details' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private (owner or admin)
router.put('/:id/cancel', ensureAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to cancel this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel an order that has been shipped or delivered' });
    }
    
    // Update order status
    order.status = 'cancelled';
    
    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    
    // If payment was made, mark for refund
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics
// @access  Private (admin only)
router.get('/stats/summary', ensureAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Calculate total revenue
    const orders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    res.json({
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error while fetching order statistics' });
  }
});

module.exports = router;
