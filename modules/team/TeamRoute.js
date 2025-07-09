
// Authentications
const authenticate = require('../../middleware/authenticate');
const team = require('./controllers/TeamApi');

module.exports = function (router) {
    router.post('/api/team/create-team', authenticate, team.createTeam);
    router.put('/api/team/update-team', authenticate, team.updateTeam);
    router.delete('/api/team/delete-team', authenticate, team.deleteTeam);
    router.get('/api/team/get-team', team.getTeam);
    router.get('/api/team/get-teams', team.getTeams);
};



