const Joi = require('joi');

const productValidationSchema = Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().required(),
    price: Joi.number().min(0.01).required(),
    sku: Joi.string().min(3).max(50),
    stockQuantity: Joi.number().integer().min(0).required(),
    imageUrl: Joi.string().uri(),
    categoryId: Joi.number().integer().required(),
    isActive: Joi.boolean(),
    discountPercentage: Joi.number().min(0).max(100)
});

const categoryValidationSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string(),
    slug: Joi.string().min(2).max(100),
    imageUrl: Joi.string().uri(),
    isActive: Joi.boolean()
});

const userRegistrationSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15),
    address: Joi.string()
});

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const orderValidationSchema = Joi.object({
    shippingAddress: Joi.string().required(),
    billingAddress: Joi.string(),
    paymentMethod: Joi.string().valid('credit_card', 'paypal', 'stripe', 'cash_on_delivery').required(),
    notes: Joi.string(),
    items: Joi.array().items(Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required()
    })).min(1).required()
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

module.exports = {
    productValidationSchema,
    categoryValidationSchema,
    userRegistrationSchema,
    userLoginSchema,
    orderValidationSchema,
    validate
};