const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const validateProduct = require('../middleware/validateProduct');

const router = express.Router();

const allowedSortFields = [
    'name',
    'sku',
    'category',
    'price',
    'quantity',
    'reorderLevel',
    'supplier',
    'createdAt',
    'updatedAt'
];

// Helper: Validate MongoDB ObjectId
const validateObjectId = (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({
            message: 'Invalid product ID'
        });

        return false;
    }

    return true;
};

// CREATE: Add a new product
router.post('/', validateProduct, async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

// READ: Get all products with filtering, sorting and pagination
router.get('/', async (req, res, next) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            sort = 'createdAt',
            order = 'desc',
            page = '1',
            limit = '10'
        } = req.query;

        const filter = {};

        // Filter by category
        if (category !== undefined) {
            if (category.trim() === '') {
                return res.status(400).json({
                    message: 'Category cannot be empty'
                });
            }

            filter.category = category;
        }

        // Filter by price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                const minimum = Number(minPrice);

                if (
                    minPrice.trim() === '' ||
                    !Number.isFinite(minimum) ||
                    minimum < 0
                ) {
                    return res.status(400).json({
                        message: 'minPrice must be a non-negative number'
                    });
                }

                filter.price.$gte = minimum;
            }

            if (maxPrice !== undefined) {
                const maximum = Number(maxPrice);

                if (
                    maxPrice.trim() === '' ||
                    !Number.isFinite(maximum) ||
                    maximum < 0
                ) {
                    return res.status(400).json({
                        message: 'maxPrice must be a non-negative number'
                    });
                }

                filter.price.$lte = maximum;
            }

            if (
                filter.price.$gte !== undefined &&
                filter.price.$lte !== undefined &&
                filter.price.$gte > filter.price.$lte
            ) {
                return res.status(400).json({
                    message: 'minPrice cannot exceed maxPrice'
                });
            }
        }

        // Validate sorting
        if (!allowedSortFields.includes(sort)) {
            return res.status(400).json({
                message: 'Invalid sort field'
            });
        }

        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                message: 'order must be asc or desc'
            });
        }

        // Validate pagination
        if (!/^[1-9]\d*$/.test(page)) {
            return res.status(400).json({
                message: 'page must be a positive integer'
            });
        }

        if (!/^[1-9]\d*$/.test(limit)) {
            return res.status(400).json({
                message: 'limit must be a positive integer'
            });
        }

        const pageNumber = Number(page);
        const requestedLimit = Number(limit);

        if (
            !Number.isSafeInteger(pageNumber) ||
            !Number.isSafeInteger(requestedLimit)
        ) {
            return res.status(400).json({
                message: 'page and limit must be safe integers'
            });
        }

        // Limit the maximum page size
        const pageSize = Math.min(100, requestedLimit);

        const sortOptions = {
            [sort]: order === 'asc' ? 1 : -1
        };

        // Fetch products
        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageSize),
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
});

// GET: Low-stock alert report
router.get('/low-stock', async (req, res, next) => {
    try {
        const lowStockItems = await Product.find({
            $expr: {
                $lte: ['$quantity', '$reorderLevel']
            }
        }).sort({ quantity: 1 });

        res.status(200).json({
            count: lowStockItems.length,
            lowStockItems
        });
    } catch (error) {
        next(error);
    }
});

// GET: Category-wise inventory summary using aggregation
router.get('/summary', async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalItems: {
                        $sum: 1
                    },
                    totalQuantity: {
                        $sum: '$quantity'
                    },
                    totalStockValue: {
                        $sum: {
                            $multiply: ['$price', '$quantity']
                        }
                    },
                    avgPrice: {
                        $avg: '$price'
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        res.status(200).json({
            categories: summary.length,
            summary
        });
    } catch (error) {
        next(error);
    }
});

// READ: Get a single product by ID
router.get('/:id', async (req, res, next) => {
    try {
        if (!validateObjectId(req, res)) {
            return;
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

// UPDATE: Update product details
router.put('/:id', validateProduct, async (req, res, next) => {
    try {
        if (!validateObjectId(req, res)) {
            return;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

// DELETE: Delete a product
router.delete('/:id', async (req, res, next) => {
    try {
        if (!validateObjectId(req, res)) {
            return;
        }

        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Product deleted',
            id: product._id
        });
    } catch (error) {
        next(error);
    }
});

// PATCH: Safely adjust product stock
router.patch('/:id/stock', async (req, res, next) => {
    try {
        if (!validateObjectId(req, res)) {
            return;
        }

        const body = req.body;

        if (
            !body ||
            typeof body !== 'object' ||
            Array.isArray(body)
        ) {
            return res.status(400).json({
                message: 'Request body must be a valid JSON object'
            });
        }

        const { change } = body;

        if (
            typeof change !== 'number' ||
            !Number.isSafeInteger(change) ||
            change === 0
        ) {
            return res.status(400).json({
                message: 'Change must be a non-zero integer'
            });
        }

        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                quantity: {
                    $gte: Math.max(0, -change)
                }
            },
            {
                $inc: {
                    quantity: change
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            const existingProduct = await Product.exists({
                _id: req.params.id
            });

            if (!existingProduct) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            return res.status(400).json({
                message: 'Insufficient stock for this adjustment'
            });
        }

        res.status(200).json({
            message: 'Stock updated',
            product
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
