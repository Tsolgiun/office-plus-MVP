const Building = require('../models/building.model');

// Create new building
const createBuilding = async (req, res) => {
  try {
    const building = new Building({
      ...req.body,
      owner: req.user._id
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

// Get single building by ID
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

// Search buildings
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
  searchBuildings
};
