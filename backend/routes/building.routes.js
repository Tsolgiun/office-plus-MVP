const express = require('express');
const router = express.Router();
const { auth, isOwner } = require('../middleware/auth.middleware');
const {
  createBuilding,
  getOwnerBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
  searchBuildings
} = require('../controllers/building.controller');

// All routes require authentication and owner role
router.use(auth, isOwner);

// Create new building
router.post('/', createBuilding);

// Get all buildings for owner
router.get('/', getOwnerBuildings);

// Search buildings
router.get('/search', searchBuildings);

// Get single building
router.get('/:id', getBuildingById);

// Update building
router.put('/:id', updateBuilding);

// Delete building
router.delete('/:id', deleteBuilding);

module.exports = router;
