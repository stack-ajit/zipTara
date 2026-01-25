const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// @route   POST api/upload
// @desc    Upload file to Cloudinary and return URL
// @access  Private (should be, but using Multer middleware handles it)
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        res.json({ url: req.file.path });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
