'use strict';

// Authentications
const authenticate = require('../../middleware/authenticate');
const project = require('./controllers/ProjectApi'); 

module.exports = function (router) {
    router.post('/api/project/create-project', authenticate, project.createProject);
    router.put('/api/project/update-project', authenticate, project.updateProject);
    router.delete('/api/project/delete-project', authenticate, project.deleteProject);
    router.get('/api/project/get-project', project.getProject);
    router.get('/api/project/get-projects', project.getProjects);

    router.get('/api/project/get-project-types', project.getProjectTypes);
    router.get('/api/project/get-project-type', project.getProjectType);
    router.post('/api/project/create-project-type', authenticate, project.createProjectType);
    router.put('/api/project/update-project-type', authenticate, project.updateProjectType);
    router.delete('/api/project/delete-project-type', authenticate, project.deleteProjectType);
};



