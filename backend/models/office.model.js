const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  efficiency: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  capacity: {
    type: Number,
    required: true
  },
  renovation: {
    type: String,
    required: true,
    trim: true
  },
  orientation: {
    type: String,
    trim: true
  },
  leaseTerm: {
    type: String,
    required: true,
    trim: true
  },
  photos: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'rented', 'pending', 'maintenance'],
    default: 'available'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
officeSchema.index({ buildingId: 1 });
officeSchema.index({ status: 1 });
officeSchema.index({ pricePerUnit: 1, area: 1 });
officeSchema.index({ tags: 1 });

// Pre-save middleware to update lastUpdated
officeSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Office', officeSchema);
