const Model = require('../models/teamModel');


class Team {
    constructor(props = {}) {
        this.props = props;
        this.slug = props.slug;
        this._id = props._id
    }


    
}


module.exports = Team