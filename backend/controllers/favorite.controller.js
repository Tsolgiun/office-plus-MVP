const User = require('../models/user.model');
const Building = require('../models/building.model');
const Office = require('../models/office.model');

// Toggle building favorite
exports.toggleBuildingFavorite = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    const favoriteIndex = user.favoriteBuildings.indexOf(buildingId);
    if (favoriteIndex === -1) {
      user.favoriteBuildings.push(buildingId);
    } else {
      user.favoriteBuildings.splice(favoriteIndex, 1);
    }

    await user.save();
    res.json({ 
      favorited: favoriteIndex === -1,
      favorites: user.favoriteBuildings 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle office favorite
exports.toggleOfficeFavorite = async (req, res) => {
  try {
    const { officeId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const office = await Office.findById(officeId);
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    const favoriteIndex = user.favoriteOffices.indexOf(officeId);
    if (favoriteIndex === -1) {
      user.favoriteOffices.push(officeId);
    } else {
      user.favoriteOffices.splice(favoriteIndex, 1);
    }

    await user.save();
    res.json({ 
      favorited: favoriteIndex === -1,
      favorites: user.favoriteOffices 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user favorites
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('favoriteBuildings')
      .populate('favoriteOffices');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      buildings: user.favoriteBuildings,
      offices: user.favoriteOffices
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
