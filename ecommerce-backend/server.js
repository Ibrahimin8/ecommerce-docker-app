require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerSpec = require('./src/docs/swagger');
const swaggerUi = require('swagger-ui-express');

// Import Configs
const db = require('./src/models');
const redisClient = require('./src/config/redis');

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
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// --- UPDATED CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://ecommerce-docker-app.onrender.com',
  'https://ecommerce-docker-app.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Landing Route
app.get('/', (req, res) => {
  res.send('🚀 E-Commerce Production API is Running! View Docs at /api-docs');
});

// --- ROUTES ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes); // This contains the forgot-password and reset-password routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Production system healthy' });
});

app.use(errorHandler);

// --- SERVER INITIALIZATION ---
// Render will automatically inject process.env.PORT. 
// Do NOT hardcode the port when deploying.
const PORT = process.env.PORT || 5003; 

const startServer = async () => {
    try {
        // 1. Connect to Neon PostgreSQL
        await db.sequelize.authenticate();
        console.log('✅ Database connected (Neon)');
        
        // Sync models (Careful with {alter: true} in production, but okay for MVP)
        await db.sequelize.sync({ alter: true });
        console.log('✅ Models synced');

        // 2. Connect to Upstash Redis
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        console.log('✅ Redis connected (Upstash)');

        // 3. Listen - Binding to 0.0.0.0 is correct for Render
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server listening on port ${PORT}`);
            console.log(`🌍 Live URL: https://ecommerce-docker-app.onrender.com`);
        });
    } catch (err) {
        console.error('❌ Server failed to start:', err);
        process.exit(1);
    }
};

startServer();