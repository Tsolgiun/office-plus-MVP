const router = require('express').Router();
const { auth } = require('../middleware/auth.middleware');
const favoriteController = require('../controllers/favorite.controller');

// Get user's favorites (both buildings and offices)
router.get('/', auth, favoriteController.getFavorites);

// Toggle building favorite
router.post('/buildings/:buildingId', auth, favoriteController.toggleBuildingFavorite);

// Toggle office favorite
router.post('/offices/:officeId', auth, favoriteController.toggleOfficeFavorite);

module.exports = router;
