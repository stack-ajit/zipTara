const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
        // Not required — Google-authenticated users won't have a password
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values (for non-Google users)
    },
    fullName: {
        type: String
    },
    dob: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    savedTrips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    }]
});

module.exports = mongoose.model('User', UserSchema);
