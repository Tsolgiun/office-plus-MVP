const Office = require('../models/office.model');
const Building = require('../models/building.model');
const cloudinary = require('../config/cloudinary');

// Create new office
const createOffice = async (req, res) => {
  try {
    // Get image URLs from multer middleware
    const photos = req.files ? req.files.map(file => file.path) : [];

    // Verify building exists and user owns it
    const building = await Building.findOne({
      _id: req.body.buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    const office = new Office({
      ...req.body,
      photos
    });
    await office.save();

    res.status(201).json({
      message: 'Office created successfully',
      office
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating office',
      error: error.message
    });
  }
};

// Get all offices in a building
const getBuildingOffices = async (req, res) => {
  try {
    // Verify building belongs to user
    const building = await Building.findOne({
      _id: req.params.buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    const offices = await Office.find({ buildingId: req.params.buildingId })
      .sort({ floor: 1, createdAt: -1 });

    res.json(offices);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching offices',
      error: error.message
    });
  }
};

// Get single office by ID
const getOfficeById = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    // Verify building belongs to user
    const building = await Building.findOne({
      _id: office.buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(office);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching office',
      error: error.message
    });
  }
};

// Update office
// Upload images for existing office
const uploadImages = async (req, res) => {
  try {
    // First verify user owns the building that contains this office
    const office = await Office.findById(req.params.id);
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    const building = await Building.findOne({
      _id: office.buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found or not authorized' });
    }

    // Get new image URLs
    const newPhotos = req.files ? req.files.map(file => file.path) : [];
    
    // Add new photos to existing ones
    office.photos = [...office.photos, ...newPhotos];
    await office.save();

    res.json({
      message: 'Images uploaded successfully',
      photos: office.photos
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// Delete image from office
const deleteImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.params;
    
    // Verify user owns the building that contains this office
    const office = await Office.findById(id);
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    const building = await Building.findOne({
      _id: office.buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found or not authorized' });
    }

    // Remove image from Cloudinary
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    // Remove image URL from office
    office.photos = office.photos.filter(photo => photo !== imageUrl);
    await office.save();

    res.json({
      message: 'Image deleted successfully',
      photos: office.photos
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting image',
      error: error.message
    });
  }
};

const updateOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    // Verify building belongs to user
    const building = await Building.findOne({
      _id: office.buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      office[key] = req.body[key];
    });

    await office.save();
    res.json({
      message: 'Office updated successfully',
      office
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating office',
      error: error.message
    });
  }
};

// Delete office
const deleteOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    // Verify building belongs to user
    const building = await Building.findOne({
      _id: office.buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    await office.remove();
    res.json({
      message: 'Office deleted successfully',
      office
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting office',
      error: error.message
    });
  }
};

// Search offices
// Search offices (protected route for owners)
const searchOffices = async (req, res) => {
  try {
    const {
      buildingId,
      minArea,
      maxArea,
      minPrice,
      maxPrice,
      status,
      tags,
      floor,
      page = 1,
      limit = 10
    } = req.query;

    // Verify building belongs to user
    const building = await Building.findOne({
      _id: buildingId,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    const query = { buildingId };

    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }

    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }

    if (status) {
      query.status = status;
    }

    if (tags) {
      query.tags = { $all: tags.split(',') };
    }

    if (floor) {
      query.floor = Number(floor);
    }

    const offices = await Office.find(query)
      .sort({ floor: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Office.countDocuments(query);

    res.json({
      offices,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching offices',
      error: error.message
    });
  }
};

// Public search for all available offices
const searchPublicOffices = async (req, res) => {
  try {
    const {
      minArea,
      maxArea,
      minPrice,
      maxPrice,
      status = 'available',
      tags,
      floor,
      page = 1,
      limit = 12
    } = req.query;

    const query = { status }; // Default to available offices only

    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }

    if (minPrice || maxPrice) {
      query.totalPrice = {};
      if (minPrice) query.totalPrice.$gte = Number(minPrice);
      if (maxPrice) query.totalPrice.$lte = Number(maxPrice);
    }

    if (tags) {
      query.tags = { $all: tags.split(',') };
    }

    if (floor) {
      query.floor = Number(floor);
    }

    const offices = await Office.find(query)
      .sort({ totalPrice: 1, floor: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Office.countDocuments(query);

    res.json({
      data: offices,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching offices',
      error: error.message
    });
  }
};

// Get public office by ID
const getPublicOfficeById = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    res.json(office);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching office',
      error: error.message
    });
  }
};

// Get all public offices in a building
const getPublicBuildingOffices = async (req, res) => {
  try {
    const offices = await Office.find({ 
      buildingId: req.params.buildingId,
      status: 'available'  // Only show available offices
    }).sort({ floor: 1, createdAt: -1 });
    
    res.json(offices);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching offices',
      error: error.message
    });
  }
};

module.exports = {
  createOffice,
  getBuildingOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
  searchOffices,
  searchPublicOffices,
  uploadImages,
  deleteImage,
  getPublicBuildingOffices,
  getPublicOfficeById
};
