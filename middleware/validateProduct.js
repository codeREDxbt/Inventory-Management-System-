const validateProduct = (req, res, next) => {
    const body = req.body;

    // Validate request body
    if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body)
    ) {
        return res.status(400).json({
            message: 'Request body must be a valid JSON object'
        });
    }

    const {
        name,
        sku,
        category,
        price,
        quantity,
        reorderLevel,
        supplier
    } = body;

    const errors = [];

    // Check required fields
    const requiredFields = {
        name,
        sku,
        category,
        price,
        quantity,
        reorderLevel,
        supplier
    };

    for (const [field, value] of Object.entries(requiredFields)) {
        if (
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '')
        ) {
            errors.push(`${field} is required`);
        }
    }

    // Validate price
    if (
        price !== undefined &&
        (
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            price < 0
        )
    ) {
        errors.push('Price must be a non-negative number');
    }

    // Validate quantity and reorder level
    for (const field of ['quantity', 'reorderLevel']) {
        const value = body[field];

        if (
            value !== undefined &&
            (
                typeof value !== 'number' ||
                !Number.isSafeInteger(value) ||
                value < 0
            )
        ) {
            errors.push(
                `${field} must be a non-negative integer`
            );
        }
    }

    // Return validation errors
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Input validation failed',
            errors
        });
    }

    next();
};

module.exports = validateProduct;
