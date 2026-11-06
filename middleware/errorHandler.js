const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    // Handle malformed JSON
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: 'Invalid JSON format'
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Product validation failed',
            errors: Object.values(err.errors).map(
                error => error.message
            )
        });
    }

    // Handle duplicate SKU
    if (err.code === 11000) {
        return res.status(400).json({
            message: 'SKU already exists'
        });
    }

    // Handle invalid MongoDB ObjectId
    if (
        err.name === 'CastError' &&
        err.kind === 'ObjectId'
    ) {
        return res.status(400).json({
            message: 'Invalid product ID'
        });
    }

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        message: statusCode >= 500
            ? 'Server error'
            : err.message
    });
};

module.exports = errorHandler;