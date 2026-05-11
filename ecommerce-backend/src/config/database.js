const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const { log } = require('node:console');

dotenv.config();

// 1. Define the config object (CLI will look for 'development')
const dbConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    //logging: process.env.NODE_ENV === 'development' ? console.log : false,
    logging: false, // Disable logging for cleaner output
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// 2. Initialize the instance (For your Express App)
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

// 3. Export both! 'development' is for the CLI, others are for your code.
module.exports = { 
    sequelize, 
    testConnection, 
    development: dbConfig 
};