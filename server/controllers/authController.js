const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Register User
exports.register = async (req, res) => {
    const { username, email, password, fullName, dob } = req.body;
    try {
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, email, password, fullName, dob });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, dob: user.dob } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login User
exports.login = async (req, res) => {
    const { identifier, password } = req.body; // identifier = email or username
    try {
        let user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, savedTrips: user.savedTrips } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    const { fullName, dob } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.fullName = fullName;
        user.dob = dob;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
// Change Password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Google-only users don't have a password to change
        if (!user.password) {
            return res.status(400).json({ msg: 'Your account uses Google sign-in. Password change is not available.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Google OAuth Login/Register
exports.googleAuth = async (req, res) => {
    const { credential } = req.body; // This is an access_token from the implicit flow

    try {
        // Verify the access_token by fetching user info from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` }
        });

        if (!response.ok) {
            return res.status(401).json({ msg: 'Invalid Google token' });
        }

        const payload = await response.json();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ msg: 'Unable to get email from Google account' });
        }

        // Check if a user with this Google ID already exists
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if a user with this email already exists (they registered with email/password before)
            user = await User.findOne({ email });

            if (user) {
                // Link their Google ID to their existing account
                user.googleId = googleId;
                if (!user.fullName && name) user.fullName = name;
                await user.save();
            } else {
                // Create a brand-new user
                // Generate a unique username from the email prefix
                let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                let username = baseUsername;
                let counter = 1;
                while (await User.findOne({ username })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                user = new User({
                    username,
                    email,
                    googleId,
                    fullName: name || ''
                });
                await user.save();
            }
        }

        // Generate JWT
        const jwtPayload = { user: { id: user.id } };

        jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    savedTrips: user.savedTrips
                }
            });
        });

    } catch (err) {
        console.error('Google Auth Error:', err.message);
        res.status(401).json({ msg: 'Google authentication failed. Please try again.' });
    }
};
