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
        type: String,
        required: true
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
