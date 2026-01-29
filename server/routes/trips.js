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

// @route   POST api/trips/:id/star
// @desc    Toggle star (Tara) trip
// @access  Private
router.post('/:id/star', auth, tripController.toggleStarTrip);

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

// --- Comment Routes ---
const commentController = require('../controllers/commentController');

// @route   GET api/trips/:id/comments
// @desc    Get all comments for a trip
// @access  Private
router.get('/:id/comments', auth, commentController.getComments);

// @route   POST api/trips/:id/comments
// @desc    Add a comment to a trip
// @access  Private
router.post('/:id/comments', auth, commentController.addComment);

// @route   POST api/trips/:id/comments/:commentId/reply
// @desc    Reply to a comment
// @access  Private
router.post('/:id/comments/:commentId/reply', auth, commentController.replyToComment);

// @route   DELETE api/trips/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;
