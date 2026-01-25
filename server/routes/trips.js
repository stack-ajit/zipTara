const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET api/trips
// @desc    Get all users trips
// @access  Private
router.get('/', auth, tripController.getTrips);

// @route   GET api/trips/public
// @desc    Get all public trips
// @access  Private (for now)
router.get('/public', auth, tripController.getPublicTrips);

// @route   POST api/trips/:id/save
// @desc    Toggle save trip
// @access  Private
router.post('/:id/save', auth, tripController.toggleSaveTrip);

// @route   GET api/trips/:id
// @desc    Get single trip
// @access  Private (Public if shared)
router.get('/:id', auth, tripController.getTrip);

// @route   POST api/trips
// @desc    Create a trip
// @access  Private
router.post('/', auth, upload.single('cover'), tripController.createTrip);

// @route   PUT api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', auth, upload.single('cover'), tripController.updateTrip);

// @route   DELETE api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', auth, tripController.deleteTrip);

module.exports = router;
