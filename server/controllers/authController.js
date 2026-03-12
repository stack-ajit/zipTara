const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendPasswordResetEmail } = require('../utils/email');

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
    const { fullName, dob, username } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // If username is being changed, validate uniqueness and format
        if (username && username !== user.username) {
            // Validate username format
            if (username.length < 3) {
                return res.status(400).json({ msg: 'Username must be at least 3 characters' });
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return res.status(400).json({ msg: 'Username can only contain letters, numbers, and underscores' });
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ msg: 'Username is already taken' });
            }
            user.username = username;
        }

        if (fullName !== undefined) user.fullName = fullName;
        if (dob !== undefined) user.dob = dob;

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
        // Using v2 endpoint which is more stable and doesn't require additional scopes
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${credential}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Auth Error Response:', errorData);
            return res.status(401).json({ msg: 'Invalid or expired Google token' });
        }

        const payload = await response.json();
        // log payload for debugging account identification issues
        console.log('Google payload received in /auth/google:', payload);

        const googleId = payload.id || payload.sub;
        const { email, name, picture } = payload;

        if (!googleId) {
            console.error('Google payload missing ID:', payload);
            return res.status(400).json({ msg: 'Unable to get identifier from Google account' });
        }

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
                // DON'T create the user yet. Return the profile data for frontend to handle.
                return res.json({
                    isNewUser: true,
                    googleProfile: {
                        googleId,
                        email,
                        fullName: name || '',
                        picture
                    }
                });
            }
        }

        // Generate JWT
        const jwtPayload = { user: { id: user.id } };

        jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                isNewUser: !!user._isNewUser,
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

// Finalize Google Registration (Create User)
exports.googleRegister = async (req, res) => {
    const { username, email, googleId, fullName, dob } = req.body;

    try {
        // Validate uniqueness one last time
        let existingUser = await User.findOne({ $or: [{ email }, { username }, { googleId }] });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const user = new User({
            username,
            email,
            googleId,
            fullName,
            dob
        });

        await user.save();

        const payload = { user: { id: user.id } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    dob: user.dob
                }
            });
        });
    } catch (err) {
        console.error('Google Register Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Forgot Password — sends a reset link
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether user exists
            return res.json({ msg: 'If that email is registered, a reset link has been sent.' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Build the reset URL (points to the frontend)
        const clientUrl = process.env.CLIENT_URL || 'https://ziptara.in';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        await sendPasswordResetEmail(user.email, resetUrl);

        res.json({ msg: 'If that email is registered, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot Password Error:', err.message);
        res.status(500).send('Server error');
    }
};

// Reset Password — verifies token and sets new password
exports.resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired reset token. Please request a new one.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ msg: 'Password reset successful. You can now log in.' });
    } catch (err) {
        console.error('Reset Password Error:', err.message);
        res.status(500).send('Server error');
    }
};
