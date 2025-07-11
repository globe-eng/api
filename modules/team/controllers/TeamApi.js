
const Team = require("./Team");


exports.getTeam = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const team = new Team(authUser);
        const getTeam = await team.getTeam(query)

        if(getTeam){
            return res.json({
                success: true,
                ...getTeam,
                response: 'Team Found',
                message: 'Team data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Team Not Found',
                message: 'No team found with the provided information.'
            });
        }
    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.getTeams = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const team = new Team(query);
        const getTeams = await team.getTeams(query)
        return res.json(getTeams);
    } catch (e) {
        return res.json([]);
    }
}

exports.createTeam = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const team = new Team();
        const result = await team.create(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Team Found',
                message: 'Team Created successfully.'
            });
        } else {
            return res.json(result);
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.updateTeam = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const team = new Team();
        const result = await team.update(body)

        if(result){
            return res.json({
                success: true,
                response: 'Team Found',
                message: 'Team updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the team, please try again'
            });
        }

    } catch (e) {
        //console.log(e)
        return res.json({
            success: false,
            response: e.message || 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

exports.deleteTeam = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const team = new Team();
        const result = await team.delete(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Team Found',
                message: 'Team delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the team, please try again',
                ...result,
            });
        }

    } catch (e) {
        console.log(e)
        return res.json({
            success: false,
            response: 'Failed',
            message: 'There was an error, please ty again'
        });
    }
}

