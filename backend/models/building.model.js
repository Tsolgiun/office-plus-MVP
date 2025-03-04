const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      region: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      fullAddress: {
        type: String,
        required: true
      }
    },
    metro: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  priceRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  areaRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  grade: {
    type: String,
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
buildingSchema.index({ name: 1, 'location.address': 1 });
buildingSchema.index({ owner: 1 });
buildingSchema.index({ tags: 1 });

module.exports = mongoose.model('Building', buildingSchema);
