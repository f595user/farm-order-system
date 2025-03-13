const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, inStock, page = 1, limit = 20 } = req.query;
    let query = {};
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by search term if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by stock availability if provided
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
      query.status = '販売中';
    }
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination info
    const total = await Product.countDocuments(query);
    
    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance when you don't need Mongoose document methods
    
    // Add pagination metadata
    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/products/:id - Product ID:', req.params.id);
    
    if (!req.params.id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Product not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product found:', product.name);
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/', ensureAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      unit,
      category,
      images,
      isAvailable,
      lowStockThreshold
    } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      unit,
      category,
      images,
      isAvailable,
      lowStockThreshold
    });
    
    const product = await newProduct.save();
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
router.put('/:id', ensureAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      unit,
      category,
      images,
      isAvailable,
      lowStockThreshold
    } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        stock,
        unit,
        category,
        images,
        isAvailable,
        lowStockThreshold
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
router.delete('/:id', ensureAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.remove();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Admin only)
router.put('/:id/stock', ensureAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ message: 'Stock value is required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.stock = stock;
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error while updating stock' });
  }
});

// @route   PUT /api/products/:id/status
// @desc    Update product status
// @access  Private (Admin only)
router.put('/:id/status', ensureAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.status = status;
    
    // Update isAvailable for backward compatibility
    product.isAvailable = (status === '販売中');
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error while updating status' });
  }
});

// @route   PUT /api/products/:id/shipping-estimate
// @desc    Update product shipping estimate
// @access  Private (Admin only)
router.put('/:id/shipping-estimate', ensureAdmin, async (req, res) => {
  try {
    const { shippingEstimate } = req.body;
    
    if (!shippingEstimate) {
      return res.status(400).json({ message: 'Shipping estimate is required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.shippingEstimate = shippingEstimate;
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update shipping estimate error:', error);
    res.status(500).json({ message: 'Server error while updating shipping estimate' });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      status: '販売中'
    });
    
    res.json(products);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/low-stock
// @desc    Get products with low stock
// @access  Private (Admin only)
router.get('/inventory/low-stock', ensureAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    const lowStockProducts = products.filter(product => product.stock <= product.lowStockThreshold);
    
    res.json(lowStockProducts);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error while fetching low stock products' });
  }
});

module.exports = router;
