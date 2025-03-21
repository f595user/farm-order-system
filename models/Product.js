const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    default: 1  // Default weight in kg
  },
  category: {
    type: String,
    required: true,
    enum: ['アスパラ', 'はちみつ']
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    required: true,
    enum: ['販売中', '販売停止', '今季の販売は終了しました'],
    default: '販売中'
  },
  shippingEstimate: {
    type: String,
    default: 'ご注文から3〜5日以内に発送'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if stock is low
ProductSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold;
});

// Virtual for checking if product is purchasable
ProductSchema.virtual('isPurchasable').get(function() {
  return this.status === '販売中';
});

module.exports = mongoose.model('Product', ProductSchema);
