const morgan = require('morgan');

const removeXPoweredBy = () => (req, res, next) => {
   morgan('dev');
  next();
};

module.exports = removeXPoweredBy;
