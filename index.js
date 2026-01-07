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
// TEMPORARY DEBUGGING: Allow all origins to rule out CORS issues
app.use(cors({
    origin: true, // Reflects the request origin, effectively allowing all
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
