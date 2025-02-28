const Building = require('../models/building.model');
const cloudinary = require('../config/cloudinary');

// Public endpoints
const getPublicBuildings = async (req, res) => {
  try {
    const buildings = await Building.find({})
      .select('name description location priceRange areaRange photos')
      .sort({ createdAt: -1 });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .select('name description location priceRange areaRange photos');
    
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchPublicBuildings = async (req, res) => {
  try {
    const {
      metroDistance,
      priceRange,
      areaRange,
      tags,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (metroDistance) {
      query['location.metro'] = metroDistance;
    }

    if (priceRange) {
      const [min, max] = priceRange.split(',').map(Number);
      query['priceRange.min'] = { $gte: min };
      query['priceRange.max'] = { $lte: max };
    }

    if (areaRange) {
      const [min, max] = areaRange.split(',').map(Number);
      query['areaRange.min'] = { $gte: min };
      query['areaRange.max'] = { $lte: max };
    }

    if (tags) {
      query.tags = { $all: tags.split(',') };
    }

    const buildings = await Building.find(query)
      .select('name description location priceRange areaRange photos')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Building.countDocuments(query);

    res.json({
      buildings,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching buildings',
      error: error.message
    });
  }
};

// Create new building
const createBuilding = async (req, res) => {
  // Get Cloudinary URLs from multer middleware
  const photos = req.files ? req.files.map(file => file.path) : [];
  console.log('Create Building - Uploaded files:', JSON.stringify(req.files, null, 2));
  console.log('Create Building - Photos array:', photos);
  try {
    const building = new Building({
      ...req.body,
      owner: req.user._id,
      photos
    });

    await building.save();
    res.status(201).json({
      message: 'Building created successfully',
      building
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating building',
      error: error.message
    });
  }
};

// Get all buildings for owner
const getOwnerBuildings = async (req, res) => {
  try {
    const buildings = await Building.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json(buildings);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching buildings',
      error: error.message
    });
  }
};

// Get single building by ID (for owner)
const getBuildingById = async (req, res) => {
  try {
    const building = await Building.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(building);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching building',
      error: error.message
    });
  }
};

// Upload images for existing building
const uploadImages = async (req, res) => {
  try {
    const building = await Building.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Get Cloudinary URLs from multer middleware
    console.log('Upload Images - Request files:', JSON.stringify(req.files, null, 2));
    console.log('Upload Images - File paths:', req.files?.map(f => f.path));
    
    const newPhotos = req.files ? req.files.map(file => file.path) : [];
    console.log('Upload Images - New photos array:', newPhotos);
    
    // Add new photos to existing ones
    building.photos = [...(building.photos || []), ...newPhotos];
    await building.save();

    res.json({
      message: 'Images uploaded successfully',
      photos: building.photos
    });
  } catch (error) {
    console.error('Upload Images - Error:', error);
    res.status(500).json({
      message: 'Error uploading images',
      error: error.message,
      details: error.stack
    });
  }
};

// Delete image from building
const deleteImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.params;
    
    const building = await Building.findOne({
      _id: id,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Remove image from Cloudinary
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    // Remove image URL from building
    building.photos = building.photos.filter(photo => photo !== imageUrl);
    await building.save();

    res.json({
      message: 'Image deleted successfully',
      photos: building.photos
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// Update building
const updateBuilding = async (req, res) => {
  try {
    const building = await Building.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      building[key] = req.body[key];
    });

    await building.save();
    res.json({
      message: 'Building updated successfully',
      building
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating building',
      error: error.message
    });
  }
};

// Delete building
const deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json({
      message: 'Building deleted successfully',
      building
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting building',
      error: error.message
    });
  }
};

// Search owner's buildings
const searchBuildings = async (req, res) => {
  try {
    const {
      metroDistance,
      priceRange,
      areaRange,
      tags,
      page = 1,
      limit = 10
    } = req.query;

    const query = { owner: req.user._id };

    if (metroDistance) {
      query['location.metro'] = metroDistance;
    }

    if (priceRange) {
      const [min, max] = priceRange.split(',').map(Number);
      query['priceRange.min'] = { $gte: min };
      query['priceRange.max'] = { $lte: max };
    }

    if (areaRange) {
      const [min, max] = areaRange.split(',').map(Number);
      query['areaRange.min'] = { $gte: min };
      query['areaRange.max'] = { $lte: max };
    }

    if (tags) {
      query.tags = { $all: tags.split(',') };
    }

    const buildings = await Building.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Building.countDocuments(query);

    res.json({
      buildings,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching buildings',
      error: error.message
    });
  }
};

module.exports = {
  createBuilding,
  getOwnerBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
  searchBuildings,
  uploadImages,
  deleteImage,
  // Public endpoints
  getPublicBuildings,
  getPublicBuildingById,
  searchPublicBuildings
};
