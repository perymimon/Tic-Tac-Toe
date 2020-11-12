// loads environment variables from a .env file into process.env
require('dotenv').config()
const Users = require('./users');
const Games = require('./games');

Users.create('bob', true) /*AI*/

const serverPort = process.env.SERVER_PORT || 4000;

const io = require('socket.io')({
    pingTimeout: 60000,
    pingInterval: 12000,
});
Games.attach(io);
Users.on('update', function () {
    io.sockets.emit('users-list', Users.list())
    console.log('User update');
})
Users.on('arenas-updated', function (userid, arenasSet) {
    io.in(userid).emit('arenas', [...arenasSet]);
})

function welcome(socket, user) {
    socket.join(user.id)
    socket.emit('user', user);
    socket.emit('arenas', [...user.arenas]);

    socket.on('challenge', function (user2) {
        if (!user) return;
        const game = new Games.Arena(user.id, user2.id);
        // const game = Games.create(user.id, user2.id);
        Users.addArena(user.id, game.id);
        Users.addArena(user2.id, game.id);
    })
    socket.on('remove-arena', function (arenaid) {
        Users.removeArena(this.user.id, arenaid)
    })

    socket.emit('users-list', Users.list());

}

io.on('connection', socket => {
    socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id}`);
        socket.removeAllListeners('user-register')
        socket.removeAllListeners('challenge')
        socket.removeAllListeners('remove-arena')
        socket.removeAllListeners('hello')
        // remove user from list in two steps

    });

    const userid = socket.handshake.query.uid;

    if (userid)
        var user = socket.user = Users.get(userid);
    console.log(`connect: ${socket.id} userid: ${userid}`);

    if (user) {
        welcome(socket, user)
        return;
    }
    socket.on('user-register', function ({name}) {
        if (user) return // all ready exist
        // 2-4 letters
        if (name.length < 2 || name.length > 4) return;
        user = socket.user = Users.create(name)
        welcome(socket, user);
    })

});

io.listen(serverPort);
