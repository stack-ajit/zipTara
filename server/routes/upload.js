const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// @route   POST api/upload
// @desc    Upload file to Cloudinary and return URL
// @access  Private (should be, but using Multer middleware handles it)
// Support both single "image" (for cover) and multiple "images" (for stops)
const uploadFields = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]);

router.post('/', uploadFields, (req, res) => {
    try {
        // Helper to get URL (Cloudinary returns full URL in path)
        const getUrl = (file) => file.path;

        // Handle Multiple Images
        if (req.files && req.files['images']) {
            const urls = req.files['images'].map(file => getUrl(file));
            return res.json({ urls });
        }

        // Handle Single Image (Legacy/Cover)
        if (req.files && req.files['image']) {
            const file = req.files['image'][0];
            return res.json({ url: getUrl(file) });
        }

        // Fallback
        if (req.file) {
            return res.json({ url: getUrl(req.file) });
        }

        return res.status(400).json({ msg: 'No file uploaded' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
