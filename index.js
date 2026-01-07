const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Robust CORS configuration
// Robust CORS configuration
const normalizeUrl = (url) => url ? url.replace(/\/$/, '') : '';

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://client-gilt-beta-49.vercel.app' // Explicitly added user's frontend
].filter(Boolean).map(normalizeUrl);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeUrl(origin);
        if (allowedOrigins.indexOf(normalizedOrigin) === -1) {
            console.error(`❌ CORS blocked origin: ${origin} (Normalized: ${normalizedOrigin})`);
            console.log('Allowed:', allowedOrigins);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send({ message: 'Cortexaa API is running 🚀' });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n✅ Server is running on port ${PORT}`);
        console.log(`🔗 API URL: http://localhost:${PORT}`);
    });
}

module.exports = app;
