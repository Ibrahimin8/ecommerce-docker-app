require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerSpec = require('./src/docs/swagger');
const swaggerUi = require('swagger-ui-express');

// Import Database models
const db = require('./src/models');



// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const { errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();

// --- MIDDLEWARES ---

// UPDATE: Modified Helmet to allow Cross-Origin Resource loading
// This fixes the net::ERR_BLOCKED_BY_RESPONSE error for images
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// FIXED CORS: Explicitly allow your Frontend and Credentials
app.use(cors({
  origin: 'http://localhost:5173', // your frontend origin
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Manually expose the raw JSON for Postman
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use(errorHandler);

// --- SERVER INITIALIZATION ---
// Ensure this matches your FRONTEND_URL port logic
const PORT = process.env.PORT || 5003; 

db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully.');
    // Use { alter: false } or { force: false } in production
    return db.sequelize.sync({ alter: false }); 
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🚀 Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });
