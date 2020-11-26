// loads environment variables from a .env file into process.env

require('dotenv').config();

var app = require('express')();
var http = require('http').createServer(app);

app.get('/', (req, res) => {
    res.send('server up')
})
const Users = require('./users');
const Arenas = require('./games');

/*Create One AI*/
Users.create('bob', true)


const serverPort = process.env.PORT;
if (!serverPort) {
    throw `process.env.PORT = ${serverPort}`
}

const io = require('socket.io')(http, {
    cors: {
        origin: '*',
        methods: 'GET,PUT,POST,DELETE,OPTIONS'.split(','),
        credentials: true
    }
});
Arenas.attach(io);
Users.on('update', () => {
    /** on new user, delete user, user model change*/
    io.sockets.emit('users-list', Users.list());
})

Users.on('new', function (user) {
    user.arenas.observe(() => {
        io.in(user.id).emit('arenas', [...user.arenas]);
    })
})

function welcome(socket, user) {
    socket.join(user.id)
    user.model.disconnect = false;
    socket.client.request._query.uid = user.id;
    socket.emit('user', user.model);
    socket.emit('arenas', [...user.arenas]);
    socket.emit('users-list', Users.list());

    socket.on('challenge', (_user2) => {
        if (!user) return;
        const user1 = Users.get(user.id);
        const user2 = Users.get(_user2.id);
        Arenas.createGame(user1, user2);
    })
    socket.on('remove-arena', (arenaId) => {
        user.arenas.delete(arenaId)
    })
    socket.on('disconnect', () => {
        // check connections amount on user's room
        // if( Object.keys(io.in(user.id).connected).length === 0 ){
        setTimeout(_ => {
            const isDisconnect = Object.keys(io.in(user.id).connected).length === 0;
            user.model.disconnect = isDisconnect;
        })
    })
}

io.on('connection', socket => {
    socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id} userid: ${user && user.id}`);
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
        socket.client.request._query.uid = user.id;
        welcome(socket, user);
        socket.removeAllListeners('user-register');
    })

});

http.listen(serverPort, () => {
    console.log(`server listening on port ${serverPort}`)
})
