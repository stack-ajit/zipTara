const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

dotenv.config();

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);


// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
}));

// Middleware (CORS) - Must be before Rate Limiter so 429 errors get CORS headers
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://ziptara.in',
    'https://www.ziptara.in',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.CLIENT_URL === '*') {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // Log blocked origins for debugging
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Limit each IP to 5000 requests per windowMs (Generous limit for smooth UX)
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again in 15 minutes"
});
app.use(limiter);
const PORT = process.env.PORT || 5000;

// Middleware (Body Parser)
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images (temporary)

// Data Sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

// Database Connection
mongoose.set('strictQuery', false); // Suppress deprecation warning
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error:');
        console.error(err);
    });

// Routes (Placeholder)
app.get('/', (req, res) => {
    res.send('Travel Trails API is running');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
