const {
    setUserOffline, setUserOnline
} = require('../controllers/UserApi');



exports = module.exports = () => {
    global.io.on('connection', (socket) => {
        let connected_user = null;


        socket.on('user.connected', async (user) => {
            socket.user = user.slug;
            socket.join(user.slug);
            connected_user = user;
            io.emit('user.online-presence', { slug: user?.slug, online: true });
            await setUserOnline(connected_user?.slug);
        });

        socket.on('user.disconnected', async (user) => {
            global.connected_user = null;
            io.emit('user.online-presence', { slug: connected_user?.slug, online: false });
            await setUserOffline(connected_user?.slug);
        });

        socket.on('user.online', async (user) => {
            global.connected_user = user;
            io.emit('user.online-presence', { slug: connected_user?.slug, online: true });
            await setUserOnline(connected_user?.slug);
        });

        socket.on('user.offline', async (user) => {
            global.connected_user = user;
            io.emit('user.online-presence', { slug: connected_user?.slug, online: false });
            await setUserOffline(connected_user?.slug);
        });

        socket.on('disconnect', async (reason) => {
            console.log('Disconnected user ', connected_user);
            io.emit('user.online-presence', { slug: connected_user?.slug, online: false });
            await setUserOffline(connected_user?.slug);
        });

    });
}