/*   Token Expiring
     * Eg: 60, "2 days", "10h", "7d".
     * A numeric value is interpreted as a seconds count. If you use a string be sure
     * you provide the time units (days, hours, etc), otherwise milliseconds
     * unit is used by default ("120" is equal to "120ms").


Cron
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ Day of the Week (0-7, where 0 and 7 represent Sunday)
│    │    │    │    └──── Month (1 - 12)
│    │    │    └───────── Day of the Month (1 - 31)
│    │    └────────────── Hour (0 - 23)
│    └─────────────────── Minute (0 - 59)
└──────────────────────── Second (0 - 59, optional)

Cron Expression	Description
* * * * * *	Runs every second
5 * * * *	Runs every 5 minutes
0 9 * * *	Runs at 9:00 AM every day
0 9 * * 1	Runs at 9:00 AM every Monday
0 12 1 * *	Runs at 12:00 PM on the 1st day of every month
0 22 * * 5	Runs at 10:00 PM every Friday
0 0 1 1 *	Runs at midnight on January 1st (New Year)

*/

const {authenticator} = require("otplib");


const development = {
    //mongoURI: "mongodb://127.0.0.1/globe-eng",
    mongoURI: 'mongodb+srv://webdevglobe:g4fpf0ePqC0kgvK4@cluster0.xwm91lt.mongodb.net/globe-eng?retryWrites=true&w=majority&appName=Cluster0',
    //mongoURI: 'mongodb+srv://webdevglobe:g4fpf0ePqC0kgvK4@cluster0.xwm91lt.mongodb.net/globe-eng-dev?retryWrites=true&w=majority&appName=Cluster0',
    redisURI: 'rediss://default:ea39265a89b14b90939f020bfd1bda80@us1-magnetic-sunbird-43036.upstash.io:43036',
    port: 2221,
    host: "localhost:2201",
    JWT_RESET_PASSWORD: "fjkdfhdjkfhfgfdkjfhdjkffdfdfjdhfkjdhfjkdfhdjkfhdkjfhdjkffdfdfjdhfkjdh",
    JWT_CONFIRM_EMAIL: "8cnb46r8gf64ggfgc4857gc84f674cv6c498r76jkfhdkjfhdjkffdfderu4985498574897534",
    FLW_PUBLIC_KEY:  "FLWPUBK_TEST-ec586df8c635b1b710ea999f3b51029a-X",
    FLW_SECRET_KEY:  "FLWSECK_TEST-0b49d6e0a6f2807203c9b7a4d637aa1c-X",
    FLW_ENCRYPTION_KEY:  "FLWSECK_TEST3c32dc87a096",
    origin: [
        "http://mia.net",
        "http://localhost:2125",
        "http://127.0.0.1:80",
    ],
    cors_whitelist: [
        "http://mia.net",
    ],
};

const production = {
    mongoURI: 'mongodb+srv://webdevglobe:g4fpf0ePqC0kgvK4@cluster0.xwm91lt.mongodb.net/globe-eng?retryWrites=true&w=majority&appName=Cluster0',
    redisURI: 'rediss://default:ea39265a89b14b90939f020bfd1bda80@us1-magnetic-sunbird-43036.upstash.io:43036',
    port: 8080,
    host: "https://poseidondigitalassets.io",
    JWT_RESET_PASSWORD: "fjkdfhdjkfhfgfdkjfhdjkffdfdfjdhfkjdhfjkdfhdjkfhdkjfhdjkffdfdfjdhfkjdh",
    JWT_CONFIRM_EMAIL: "8cnb46r8gf64ggfgc4857gc84f674cv6c498r76jkfhdkjfhdjkffdfderu4985498574897534",
    FLW_PUBLIC_KEY:  "FLWPUBK_TEST-ec586df8c635b1b710ea999f3b51029a-X",
    FLW_SECRET_KEY:  "FLWSECK_TEST-0b49d6e0a6f2807203c9b7a4d637aa1c-X",
    FLW_ENCRYPTION_KEY:  "FLWSECK_TEST3c32dc87a096",
    origin: [
        "https://globe-eng-web.vercel.app",
    ],
    cors_whitelist: [
        "https://poseidondigitalassets.io",
        "https://globe-eng-web.vercel.app",
        "https://globe-eng-admin.vercel.app",
        "http://localhost:2222",
        "http://localhost:3000",
    ],
}

const constant = {
    pageLoadingColor: '#F7BC00'
}

const host = process.env.NODE_ENV === 'production' ? production.host : development.host;

const general = {
    email: "support@poseidondigitalassets.io",
    email_noreply: "noreply@poseidondigitalassets.io",
    mobile: "",
    app_name: "Liquid Staking Protocol",
    authenticator_issuer: "poseidondigitalassets.io",
    cloudinary_cloud_name: "dcwww6qrq",
    cloudinary_api_key: "399284759767146",
    cloudinary_api_secret: "WgVmNbjpU6QpeY88vDj6Dfnv_1I",
    //awsAccessKey:  "AKIA2VLG2GO4ZEO3S3HA",
    //awsSecretKey:  "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",

    secretOrKey: "fdfdfjdhfkjdhfjkdffgfgfhdjkfhdkjfhdjkf",
    tokenExpiringDate: "365d",
    resetPasswordTokenExpiringDate: "1h",

    /* Token Expiring
     * Eg: 60, "2 days", "10h", "7d".
     * A numeric value is interpreted as a seconds count. If you use a string be sure
     * you provide the time units (days, hours, etc), otherwise milliseconds
     * unit is used by default ("120" is equal to "120ms").
     * */

    cookieExpiringDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isDev: process.env.NODE_ENV === 'development',
    isPro: process.env.NODE_ENV === 'development',

    // Login Security
    login_max_attempts: 5, //Account Locked: attempts
    //login_lock_time: 2 * 60 * 1000, //Account Locked: lock time => 2 minutes
    login_lock_time: 2 * 60 * 60 * 1000, //Account Locked: lock time => 2 hours
    login_rate_limit: 6, // Login limiter: limit
    login_rate_limit_time: 15 * 60 * 1000, // Login limiter: time => 15 minutes
    withdrawal_time: 24 * 60 * 60 * 1000, //Withdrawal after 24 hour

    username_min: 3,
    username_max: 15,
    name_min: 2,
    name_max: 30,
}


if (process.env.NODE_ENV === 'production') {
    module.exports = {
        ...general,
        ...production,
        constant: constant
    }
} else {
    module.exports = {
        ...general,
        ...development,
        constant: constant
    }
}
