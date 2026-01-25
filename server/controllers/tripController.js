const Trip = require('../models/Trip');
const User = require('../models/User');

// Get all trips for user
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort({ date: -1 });
        res.json(trips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all public trips
exports.getPublicTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ isPublic: true })
            .sort({ createdAt: -1 })
            .populate('user', 'username fullName');

        // console.log(JSON.stringify(trips, null, 2)); // Uncomment for deep debug

        res.json(trips);
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

// Get single trip
exports.getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });
        // Make sure user owns trip or it is public
        if (trip.user.toString() !== req.user.id && !trip.isPublic) {
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

        await Trip.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Trip removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
