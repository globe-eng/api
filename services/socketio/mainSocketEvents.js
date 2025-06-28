const cookie = require("cookie");
//const  { getUserForSocket } = require("../../modules/user/controllers/userController")
const config = require('../../lib/config')

exports = module.exports = () => {
    global.io.on('connection', async (socket) => {
        const cookies = cookie.parse(socket.request.headers.cookie || "");
        let handshake = socket.handshake;

        console.log("++++++++ Client Connected ++++++++")

        socket.on('user.connected', (user) => {
            socket.user = user.slug;
            socket.join(user.slug);
            global.connected_user = user;
            console.log("User Connected ",user)
        });


        //Fired when an error occurs.
        socket.on('error', (error) => {
            console.log(error)
        });


        //This event is similar to disconnect but is fired a bit earlier, when the Socket#rooms set is not empty yet
        socket.on('disconnecting', (reason) => {
            global.connected_user = null;
            console.log('++++++++ Client-'+socket.user+' Is Disconnecting ++++++++');
        });

        socket.on('disconnect', (reason) => {

        });

        // This event is fired by the Socket instance upon disconnection.
        socket.once('disconnect', (reason) => {
            global.connected_user = null;
            console.log('++++++++ Client-'+socket.user+' Is Disconnected ++++++++');
        });


    });
}