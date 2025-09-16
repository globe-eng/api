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

/*
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
    if (warning.includes('AWS SDK for JavaScript (v2)')) {
        return; // Ignore this specific warning
    }
    originalEmitWarning.call(process, warning, ...args);
};
*/



const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || config.port;



// Database
//Set up default mongoose connection
mongoose.connect(config.mongoURI, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    retryWrites: false
}).catch(error => {
    console.log(error)
});


mongoose.connection.once('open', () => {
    //createDefaultApp().then(res=>{}).catch(error => {})
    console.log('connected to database')
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

// Cors
server.use(cors({
    origin: function (origin, callback) {
        //console.log(origin)
        if (config.origin.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(null, false)
            //callback(new Error('Not allowed by CORS'))
        }
    },
    //origin: config.origin,
    credentials: true,
}));

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


