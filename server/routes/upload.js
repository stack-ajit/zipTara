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
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Helper to format path
        const formatUrl = (file) => {
            const validPath = file.path.replace(/\\/g, '/');
            return `${baseUrl}/${validPath}`;
        };

        // Handle Multiple Images
        if (req.files && req.files['images']) {
            const urls = req.files['images'].map(file => formatUrl(file));
            return res.json({ urls });
        }

        // Handle Single Image (Legacy/Cover)
        if (req.files && req.files['image']) {
            const file = req.files['image'][0];
            return res.json({ url: formatUrl(file) });
        }

        // Handle Single Image via .single() fallback if .files is empty but .file exists (though fields() populates .files)
        // Just in case multer behaves differently or middleware changed.
        if (req.file) {
            return res.json({ url: formatUrl(req.file) });
        }

        return res.status(400).json({ msg: 'No file uploaded' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
