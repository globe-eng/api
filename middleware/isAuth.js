const jwt = require('jsonwebtoken');
const config = require('../lib/config');

module.exports = async (req, res, next) => {

    const authHeader = req.get('Authorization');

    if (!authHeader){
        req.isAuth = false; // set isAuth to false
        return  next();  //  Continue
    }

    const token = authHeader.split(' ')[1]; // get token

    if(!token || token === ''){  // Check is if there is not token
        req.isAuth = false; // set isAuth to false
        return  next();  //  Continue
    }

   // console.log(token)

    //  There is token here, So then we need to verify and decode the token
    let decodedToken;
    try{
      decodedToken =  await jwt.verify(token, config.secretOrKey) // verifying toke to check if is valid and then decode it
    } catch (e) {
      // console.log(e)
        // We got into an error, maybe the token is not valid or something happen...
        req.isAuth = false; // set isAuth to false
        return  next();  //  Continue
    }

    // check if there is no decoded token
    if(!decodedToken){
        req.isAuth = false; // set isAuth to false
        return  next();  //  Continue
    }

    // Finally we have a valid verified token
    req.isAuth = true; // set isAuth to true
    req.authUser = decodedToken   // Add usrId field to the request headers
    next();  //  Continue

};
