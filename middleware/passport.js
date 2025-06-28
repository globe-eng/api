const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../lib/config');

const options = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : config.secretOrKey
};

const User = require('../modules/user/models/userModel');

module.exports = passport => {
    passport.use(new JwtStrategy(options, async (jwt_payload, done) => {

        // Check if user exist
       const user = await  User.findOne({_id: jwt_payload.id});

        if (!user) {
            return done(null, false);
        }
        
        const  data = {
            id: user.id,
            slug: user.slug,
        };

        return done(null, data);

    }))
};
