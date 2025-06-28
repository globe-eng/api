const toobusy = require('toobusy-js')

// Set maximum lag to an aggressive value.
toobusy.maxLag(10);

// Set check interval to a faster value. This will catch more latency spikes
// but may cause the check to be too sensitive.
toobusy.interval(250);

const tooBusy = () => (req, res, next) => {
    if (toobusy()) {
        res.send(503, "I'm busy right now, sorry.");
    } else {
        next();
    }
};

module.exports = tooBusy;
