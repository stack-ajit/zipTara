const Trip = require('../models/Trip');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Helper to extract public ID from URL
const extractPublicId = (url) => {
    try {
        if (!url || !url.includes('cloudinary')) return null;
        // Example: https://res.cloudinary.com/.../upload/v12345/folder/filename.jpg
        // We need 'folder/filename' (without extension)
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;

        const pathWithVersion = parts[1]; // v12345/folder/filename.jpg
        const pathParts = pathWithVersion.split('/');

        // Remove version if present (starts with v)
        if (pathParts[0].startsWith('v') && !isNaN(parseInt(pathParts[0].substring(1)))) {
            pathParts.shift();
        }

        const publicIdWithExt = pathParts.join('/');
        const publicId = publicIdWithExt.split('.')[0];

        return publicId;
    } catch (err) {
        console.error("Error extraction public ID:", err);
        return null;
    }
};

// Get all trips for user
exports.getTrips = async (req, res) => {
    try {
        const Comment = require('../models/Comment');
        const trips = await Trip.find({ user: req.user.id })
            .select('-days') // Exclude days/stops/photos for list view
            .sort({ date: -1 })
            .lean();

        // Add comment counts
        const tripIds = trips.map(t => t._id);
        const commentCounts = await Comment.aggregate([
            { $match: { trip: { $in: tripIds } } },
            { $group: { _id: '$trip', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

        const tripsWithCounts = trips.map(t => ({
            ...t,
            commentsCount: countMap[t._id.toString()] || 0
        }));

        res.json(tripsWithCounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all public trips
exports.getPublicTrips = async (req, res) => {
    try {
        const Comment = require('../models/Comment');
        const trips = await Trip.find({ isPublic: true })
            .select('-days') // Exclude heavy data
            .sort({ createdAt: -1 })
            .populate('user', 'username fullName')
            .lean();

        // Add comment counts
        const tripIds = trips.map(t => t._id);
        const commentCounts = await Comment.aggregate([
            { $match: { trip: { $in: tripIds } } },
            { $group: { _id: '$trip', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

        const tripsWithCounts = trips.map(t => ({
            ...t,
            commentsCount: countMap[t._id.toString()] || 0
        }));

        res.json(tripsWithCounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Toggle Save Trip
exports.toggleSaveTrip = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const tripId = req.params.id;

        // Check if trip exists (Optimized: select only _id)
        const trip = await Trip.findById(tripId).select('_id');
        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found' });
        }

        // Initialize savedTrips if undefined
        if (!user.savedTrips) {
            user.savedTrips = [];
        }

        // Check if already saved
        const isSaved = user.savedTrips.some(id => id.toString() === tripId);

        if (isSaved) {
            // Unsave
            user.savedTrips = user.savedTrips.filter(id => id.toString() !== tripId);
        } else {
            // Save
            user.savedTrips.push(tripId);
        }

        await user.save();
        res.json(user.savedTrips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Toggle Star Trip
exports.toggleStarTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found' });
        }

        const userId = req.user.id;

        // Ensure taras array exists (migration safety)
        if (!trip.stars) trip.stars = [];

        const isStarred = trip.stars.some(id => id.toString() === userId);

        if (isStarred) {
            // Remove tara
            trip.stars = trip.stars.filter(id => id.toString() !== userId);
        } else {
            // Add tara
            trip.stars.push(userId);
        }

        await trip.save();
        res.json(trip.stars);
    } catch (err) {
        console.error("Toggle Star Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// Get single trip
exports.getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('user', 'username fullName');
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });
        // Make sure user owns trip or it is public
        // Handle populated user object (trip.user._id)
        const tripUserId = trip.user._id ? trip.user._id.toString() : trip.user.toString();
        if (tripUserId !== req.user.id && !trip.isPublic) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Helper: Generate Auto Tags
const generateAutoTags = (trip) => {
    const tags = new Set(trip.tags || []);
    const textToCheck = `${trip.title} ${trip.location} ${trip.days?.map(d => d.title + ' ' + d.notes).join(' ')}`.toLowerCase();

    const keywords = {
        'Beach': ['beach', 'sea', 'ocean', 'coast', 'sand', 'surf'],
        'Lake': ['lake'],
        'Mountain': ['mountain', 'hill', 'trek', 'hike', 'peak', 'climb', 'altitude'],
        'City': ['city', 'urban', 'downtown', 'metro', 'museum', 'nightlife', 'club'],
        'Nature': ['forest', 'jungle', 'nature', 'wildlife', 'park', 'green'],
        'History': ['history', 'historical', 'ancient', 'ruins', 'temple', 'fort', 'castle'],
        'Romantic': ['romantic', 'honeymoon', 'couple', 'love', 'date'],
        'Family': ['family', 'kids', 'children', 'zoo'],
        'Budget': ['cheap', 'budget', 'affordable', 'saving'],
        'Luxury': ['luxury', 'resort', 'expensive', 'premium', 'villa']
    };

    Object.entries(keywords).forEach(([tag, words]) => {
        if (words.some(w => textToCheck.includes(w))) {
            tags.add(tag);
        }
    });

    return Array.from(tags);
};

// Create new trip
exports.createTrip = async (req, res) => {
    try {
        const tripData = { ...req.body };

        // Parse JSON strings if coming from FormData
        if (typeof tripData.tags === 'string') {
            try { tripData.tags = JSON.parse(tripData.tags); } catch (e) { }
        }
        if (typeof tripData.days === 'string') {
            try { tripData.days = JSON.parse(tripData.days); } catch (e) { }
        }
        if (typeof tripData.coordinates === 'string') {
            try { tripData.coordinates = JSON.parse(tripData.coordinates); } catch (e) { }
        }

        tripData.tags = generateAutoTags(tripData);

        // Handle image upload
        if (req.file) {
            tripData.cover = req.file.path;
        }

        const newTrip = new Trip({
            ...tripData,
            user: req.user.id
        });
        const trip = await newTrip.save();
        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update trip
exports.updateTrip = async (req, res) => {
    try {
        let trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });

        // Make sure user owns trip
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // 1. Capture OLD images
        const oldImages = new Set();
        if (trip.cover) oldImages.add(trip.cover);
        if (trip.days && trip.days.length > 0) {
            trip.days.forEach(d => {
                if (d.stops) {
                    d.stops.forEach(s => {
                        if (s.photos) s.photos.forEach(p => oldImages.add(p));
                    });
                }
            });
        }

        const tripData = { ...req.body };

        // Parse JSON strings if coming from FormData
        if (typeof tripData.tags === 'string') {
            try { tripData.tags = JSON.parse(tripData.tags); } catch (e) { }
        }
        if (typeof tripData.days === 'string') {
            try { tripData.days = JSON.parse(tripData.days); } catch (e) { }
        }
        if (typeof tripData.coordinates === 'string') {
            try { tripData.coordinates = JSON.parse(tripData.coordinates); } catch (e) { }
        }

        tripData.tags = generateAutoTags(tripData);

        // Remove immutable fields to prevent DB errors
        delete tripData._id;
        delete tripData.id;
        delete tripData.user;
        delete tripData.createdAt;
        delete tripData.updatedAt;
        delete tripData.__v;

        // Recursively remove _id from subdocuments (days and stops)
        if (tripData.days && Array.isArray(tripData.days)) {
            tripData.days.forEach(day => {
                delete day._id;
                if (day.stops && Array.isArray(day.stops)) {
                    day.stops.forEach(stop => {
                        delete stop._id;
                    });
                }
            });
        }

        // FAILSAFE: If cover is an object (due to upstream bug), delete it so Mongoose doesn't crash
        if (tripData.cover && typeof tripData.cover !== 'string') {
            console.warn("Detected invalid cover format (Object), removing it:", tripData.cover);
            delete tripData.cover;
        }

        // Handle image upload (New Cover)
        if (req.file) {
            tripData.cover = req.file.path;
        }

        // 2. Capture NEW images
        const newImages = new Set();
        if (tripData.cover) newImages.add(tripData.cover);
        if (tripData.days && tripData.days.length > 0) {
            tripData.days.forEach(d => {
                if (d.stops) {
                    d.stops.forEach(s => {
                        if (s.photos) s.photos.forEach(p => newImages.add(p));
                    });
                }
            });
        }

        // 3. Find deleted images (Present in OLD but not in NEW)
        const imagesToDelete = [...oldImages].filter(url => !newImages.has(url));

        // 4. Delete from Cloudinary
        if (imagesToDelete.length > 0) {
            const deletePromises = imagesToDelete.map(url => {
                const publicId = extractPublicId(url);
                if (publicId) {
                    return cloudinary.uploader.destroy(publicId);
                }
                return Promise.resolve();
            });
            // We don't await this strictly to block the response, but it's safer to await
            await Promise.all(deletePromises);
        }

        // console.log("Update Trip Body:", JSON.stringify(req.body, null, 2)); // DEBUG
        trip = await Trip.findByIdAndUpdate(req.params.id, { $set: tripData }, { new: true });
        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Delete trip
exports.deleteTrip = async (req, res) => {
    try {
        let trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });

        // Make sure user owns trip
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // 1. Collect all image URLs
        const imageUrls = [];
        if (trip.cover) imageUrls.push(trip.cover);

        if (trip.days && trip.days.length > 0) {
            trip.days.forEach(day => {
                if (day.stops && day.stops.length > 0) {
                    day.stops.forEach(stop => {
                        if (stop.photos && stop.photos.length > 0) {
                            imageUrls.push(...stop.photos);
                        }
                    });
                }
            });
        }

        // 2. Delete images from Cloudinary
        if (imageUrls.length > 0) {
            const deletePromises = imageUrls.map(url => {
                const publicId = extractPublicId(url);
                if (publicId) {
                    return cloudinary.uploader.destroy(publicId);
                }
                return Promise.resolve();
            });
            await Promise.all(deletePromises);
        }

        await Trip.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Trip removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
