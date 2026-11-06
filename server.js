const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.status(200).send('Inventory Management System API is running!');
});

// Product routes
app.use('/api/products', require('./routes/productRoutes'));

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Centralized error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            'MongoDB connection failed:',
            error.message
        );

        process.exit(1);
    });