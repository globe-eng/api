const express = require('express');
const path = require('path');
const url = require('url');
const config = require('./lib/config');
const mongoose = require('mongoose');

// Middleware
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const removeXPoweredBy = require('./middleware/removeXPoweredBy');
const isAuth = require('./middleware/isAuth');
const formidable = require('./middleware/formidable');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');

// Api Routes
const apiRoutes = require('./modules/routes');

//const {createDefaultApp} = require("./modules/app/controllers/appApi");

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || config.port;


const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
    if (warning.includes('AWS SDK for JavaScript (v2)')) {
        return; // Ignore this specific warning
    }
    originalEmitWarning.call(process, warning, ...args);
};


// Database
mongoose.connect(config.mongoURI, {
    retryWrites: false,
    connectTimeoutMS: 9999
}).catch(error => {
    console.error('MongoDB Database connection failed - Retrying to connect...');
    //setTimeout(connectMongoDB, 5000);
})

mongoose.connection.on('connected', () => {
    //createDefaultApp().then(res => {}).catch(error => {})
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
    console.log('Mongoose reconnected to MongoDB');
});


global.DB = mongoose.connection;


const server = express();


// Compression
server.use(compression({ // Compression
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false
        }
        return compression.filter(req, res)
    }
})); // Compression



//server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(formidable);

// Passport middleware
server.use(passport.initialize());
require('./middleware/passport')(passport); // Passport Config


server.use(cors())
server.use(helmet());
server.use(removeXPoweredBy());
server.use(cookieParser());


server.use(morgan('dev'));
server.use(isAuth);


// RestfulAPI Routes
server.use('/', apiRoutes);


// Default
server.get('*', (req, res) => {
    res.send('Hello dear! What are you looking for?');
});

server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Listening on http://localhost:${port}`);
});


