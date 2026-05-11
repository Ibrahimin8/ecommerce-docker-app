const redis = require('redis');

/**
 * PRODUCTION REDIS CONFIGURATION
 * This setup works for local development and Upstash Cloud Redis.
 */
const redisClient = redis.createClient({
    // If REDIS_URL starts with 'rediss://', it automatically attempts a TLS connection
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        // Essential for Upstash and most Cloud Redis providers
        tls: (process.env.REDIS_URL || '').startsWith('rediss://'),
        rejectUnauthorized: false // Allows connection to cloud-managed certificates
    }
});

// Event Listeners
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('🔄 Connecting to Redis...');
});

redisClient.on('ready', () => {
    console.log('✅ Connected to Redis ⚡');
});

// Self-invoking connection function
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('❌ Could not establish Redis connection:', err);
    }
})();

module.exports = redisClient;