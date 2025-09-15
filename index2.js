const path = require('path');
const url = require('url');
const config = require('./lib/config');
const mongoose = require('mongoose');
const cron = require('node-cron');
const AWS = require('aws-sdk');

// Middleware
// Middleware
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const cors = require('cors');
const removeXPoweredBy = require('./middleware/removeXPoweredBy');
const isAuth = require('./middleware/isAuth');
const formidable = require('./middleware/formidable');
const toobusy = require('./middleware/toobusy');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const {rateLimit} = require('express-rate-limit');
const hpp = require('hpp');

/// socket.io
const mainSocketEvents = require('./services/socketio/mainSocketEvents');
//const messageSocketEvents = require('./modules/message/messageSocketEvents');
const userSocketEvents = require('./modules/user/services/userSocketEvent');

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
    //console.error('MongoDB Database connection failed - Retrying to connect...');
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


/***********************************************************
 Creating Server
 *********************************************************/
const express = require('express');
const app = express();
const {createServer} = require("http");
const {Server} = require("socket.io");
const server = createServer(app);
global.io = new Server(server, {
    //path: "/api/socket/ping",
    addTrailingSlash: false,
    cors: {
        origin: config.origin,
        methods: ["GET", "POST"],
        credentials: true
    }
});


/***********************************************************
 Socket.io
 *********************************************************/
mainSocketEvents();
//messageSocketEvents();
userSocketEvents();


/***********************************************************
 Cron Jobs
 *********************************************************/

cron.schedule('0 * * * *', async () => {
    //await investment.maturedInvestments();
    //await investment.runUpdatePersonInvestment();
    //console.log("Running Investment...");
});

cron.schedule('0 */2 * * *', async () => {
    //await team.run_updateLevel_Bonus();
    //console.log("Running Level Bonus...");
});

cron.schedule('0 0 * * *', async () => {
    //await masterDistributor.runMasterDistributors();
    //console.log("Running Master Distributor...");  //
});

cron.schedule('*/1 * * * *', async () => {
    //await deposit.runCheckTransactions();
    //console.log("Running Deposit...");
});


////
/***********************************************************
 Middlewares
 *********************************************************/
//app.set('trust proxy', 1);

// Compression
app.use(compression({ // Compression
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false
        }
        return compression.filter(req, res)
    }
})); /// Compression

//server.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(formidable);

// Passport middleware
app.use(passport.initialize());
require('./middleware/passport')(passport); // Passport Config

// Cors
app.use(cors({
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

app.use(helmet());
app.use(helmet.hidePoweredBy({setTo: 'PHP 10.2.0'}));
app.use(removeXPoweredBy());
app.use(helmet.contentSecurityPolicy()); // Prevent XSS

app.use(cookieParser());

app.use(morgan('dev'));

app.use(isAuth);

app.use(mongoSanitize({
    // replaceWith: '_',
})); // Prevent SQL Injection

app.use(hpp());

//app.use(toobusy);


const limit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
    limit: async (req, res) => {
        //console.log(req.authUser)

        return 2 // Limit each IP to 100 requests per `window` (here, per 15 minutes).
        //setting max to zero will no longer disable the rate limiter - instead, it will ‘block’ all requests to that endpoint.
    },
    message: async (req, res) => {
        /*return res.status(429).json({
            success: false,
            message: 'Please enter the required fields',
            //errors: errors
        });*/
        return 'You can only make 10 requests every hour.'
    },
    keyGenerator: async (req, res) => {
        //console.log(req.ip)
    },

    skip: async (req, res) => {
        const allowlist = ['192.168.0.56', '::1-']
        //return allowlist.includes(req.ip)
        return false // default
    },

})


//app.use(limit)


/***********************************************************
 Routes
 *********************************************************/
app.use('/', apiRoutes);


// Default
app.get('*', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${config.app_name}</title>
        </head>
        <body>
            <h1>Hello dear! What are you looking for?</h1>
        </body>
        </html>
    `);
});


/*********************************************************
 Starting Server
 *********************************************************/
server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Listening on host http://localhost:${port} with pid ${process.pid}`);
});

process.on('SIGINT', () => {
    mongoose.connection.close().then(res => {
        console.log('MongoDB connection closed');
        process.exit(0);
    })
});

