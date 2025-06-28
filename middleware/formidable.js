const Formidable = require('formidable');
const form = Formidable();

form.setMaxListeners(100)

module.exports = async (req, res, next) => {
    const contentType = req.get('content-type');

    if(contentType && contentType.startsWith('multipart/form-data')){
        if (req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put' || req.method.toLowerCase() === 'delete') {
            try {
                await new Promise((resolve, reject) => {
                    form.parse(req, (err, fields, files) => {
                        //console.log(req)
                        if (err) {
                            next(err);
                            return;
                        }
                        req.files = files;
                        req.body = fields;
                        return next();
                    });
                })
            } catch (e) {
                next();
            }
        }
        next();  //  Continue
    } else {
        next();
    }
};
