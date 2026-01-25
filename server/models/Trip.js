const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
    id: String, // Keep frontend IDs for consistency
    time: String,
    title: String,
    desc: String,
    cost: Number,
    notes: String,
    photos: [String], // Array of photo URLs
    coordinates: {
        lat: Number,
        lng: Number
    }
});

const DaySchema = new mongoose.Schema({
    id: String,
    date: String,
    title: String,
    budget: String,
    notes: String,
    stops: [StopSchema]
});

const TripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    location: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    startDate: String,
    endDate: String,
    cover: String, // URL
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [String],
    days: [DaySchema],
    isSaved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trip', TripSchema);
