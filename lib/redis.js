const config = require("./config");

const Redis = require("ioredis");
//const redis = new Redis(config.redisURI);

const {createClient} = require("redis");
const redis = createClient({url: config.redisURI})


/*
const redis =  createClient({
    host: "127.0.0.1", // Redis server host
    port: 6379,   // Redis server port
    //password: "your_redis_password", // Password (if any)
});
*/



module.exports = {
    redis,
    Redis
};