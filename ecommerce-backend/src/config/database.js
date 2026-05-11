const { Sequelize } = require('sequelize');
const pg = require('pg'); // Explicitly require the pg driver
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL missing from .env');
    process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg, // This forces Sequelize to use the modern pg driver
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false 
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('--------------------------------------------------');
        console.log('✅ SUCCESS: Connected to Neon PostgreSQL ⚡');
        console.log('--------------------------------------------------');
    } catch (error) {
        console.error('--------------------------------------------------');
        console.error('❌ DATABASE ERROR:', error.message);
        console.log('Hint: Ensure Connection Pooling is OFF in Neon.');
        console.log('--------------------------------------------------');
        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };