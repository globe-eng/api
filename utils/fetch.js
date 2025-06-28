//const fetch = require('node-fetch');

module.exports = async (data) =>{

    const options = {
        ...data
    }

    try {
        const fetch = await import('node-fetch');
        const response = await fetch(data.url, options);
        const res =  await  response.json()
        return{
            success: true,
            data: res,
            status: response.status,
            statusText: response.statusText,
            error: null
        }
    } catch (e) {
        return{
            success: false,
            data: null,
            error: e
        }
    }
};