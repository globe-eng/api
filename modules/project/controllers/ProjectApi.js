const Project = require("./Project");


exports.getProject = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const project = new Project(authUser);
        const getProject = await project.getProject(query)

        if(getProject){
            return res.json({
                success: true,
                ...getProject,
                response: 'Project Found',
                message: 'Project data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Project Not Found',
                message: 'No project found with the provided information.'
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

exports.getProjects = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const project = new Project(query);
        const getProjects = await project.getProjects(query)
        return res.json(getProjects);
    } catch (e) {
        return res.json([]);
    }
}

exports.createProject = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const project = new Project();
        const result = await project.create(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Project Found',
                message: 'Project Created successfully.'
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

exports.updateProject = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        const files = req.files;
        let body = req.body;
        let authUser = req.authUser;

        body.files = files;

        const project = new Project();
        const result = await project.update(body)

        if(result){
            return res.json({
                success: true,
                response: 'Project Found',
                message: 'Project updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the project, please try again'
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

exports.deleteProject = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const project = new Project();
        const result = await project.delete(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Project Found',
                message: 'Project delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the project, please try again',
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


// get project types
exports.getProjectType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let authUser = req.authUser;

        const project = new Project(authUser);
        const getProjectType = await project.getProjectType(query)

        if(getProjectType){
            return res.json({
                success: true,
                ...getProjectType,
                response: 'Project Type Found',
                message: 'Project type data retrieved successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Project Type Not Found',
                message: 'No project type found with the provided information.'
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

// get project types
exports.getProjectTypes = async (req, res) => {
    try {
        const query = req.query;
        let authUser = req.authUser;

        const project = new Project(query);
        const getProjectTypes = await project.getProjectTypes(query)
        return res.json(getProjectTypes);
    } catch (e) {
        return res.json([]);
    }
}

// create project type
exports.createProjectType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const project = new Project();
        const result = await project.createProjectType(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Project Type Found',
                message: 'Project Type Created successfully.'
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

// update project type
exports.updateProjectType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const project = new Project();
        const result = await project.updateProjectType(body)

        if(result){
            return res.json({
                success: true,
                response: 'Project Type Found',
                message: 'Project Type updated successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error updating the project type, please try again'
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

// delete project type
exports.deleteProjectType = async (req, res) => {
    try {
        const slug = req.params.slug;
        const query = req.query;
        let body = req.body;
        let authUser = req.authUser;

        const project = new Project();
        const result = await project.deleteProjectType(body)

        if(result.success){
            return res.json({
                success: true,
                response: 'Project Type Found',
                message: 'Project Type delete successfully.'
            });
        } else {
            return res.json({
                success: false,
                response: 'Error',
                message: 'There was an error deleting the project type, please try again',
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