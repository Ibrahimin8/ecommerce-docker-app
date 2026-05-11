const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('../config/redis');

module.exports = session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
});