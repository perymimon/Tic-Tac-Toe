const uid = require('uid')
const Users = require('./users')
var io  = null;
const gameMap = new Map();
const EventEmitter = require('events');
const emitter = new EventEmitter();


Object.assign(module.exports, {
    get, create, getList,attach,
    on: emitter.on.bind(emitter)
})
function attach(_io){
    io = _io;
}
function get(id) {
    return gameMap.get(id);
}

function getList() {
    const list = [...gameMap].map(pair => pair[1])
    return list;
}

function create(user1, user2) {
    const id = uid();
    const users = {
        [user1.id]: user1,
        [user2.id]: user2,
    }
    const model = {
        id,
        players: [user1, user2],
        board: Array(0).fill(''),
        turn: 0,
        isStarted: false,
        isCanceled: false,
        stage: 'INVITATION'
    }
    user1.mark = 'x';
    user2.mark = 'o';

    const nspName = `game-${id}`;
    const nsp = io.of(nspName);
    console.log(`created: namespace ${nspName}`)

    function emitModelUpdate() {
        nsp.emit('update', model);
        console.log(`game ${model.id} emit update`)
    }

    nsp.on('connect', connectSocket )

    function connectSocket(socket) {
        const userid = socket.handshake.query.uid || null;
        socket.join(userid)
        const user = users[userid]
        console.log(`connected nsp ${nspName}: user ${userid}`)
        if (!user) return 'observer';
        socket.emit('update', model)

        socket.on('cancel', function () {
            model.isCanceledBy = userid;
            model.stage = 'CANCEL'
            emitModelUpdate()
        })
        socket.on('approve', function () {
            if (userid !== user2.id) return;
            model.isStarted = true;
            model.stage = 'GAME'
            emitModelUpdate()
        })
        socket.on('playerSelectCell', function (cellNumber) {
            /* some validation */
            if (!model.isStarted || model.isCanceled)
                return socket.emit('game-error', `game not started`)
            if (cellNumber < 0 && cellNumber > 8)
                return socket.emit('game-error', `cell number ${cellNumber} is out of range`)
            if (userid !== model.players[model.turn].id)
                return socket.emit('game-error', 'not your turn')

            model.board[cellNumber] = model.turn;
            updateEndSituation();

            if (!(model.winner || model.draw)) {
                model.turn = (++model.turn % 2);
            } else {
                model.stage = `END`
            }
            emitModelUpdate()

        })
    }
    nsp.in(user1.id).on('playerSelectCell', function (cellNumber) {
        console.log(`player select`, cellNumber);
    })
    nsp.in(user2.id).on('playerSelectCell', function (cellNumber) {
        console.log(`player select`, cellNumber);
    })

    gameMap.set(model.id, model)

    // emitter.emit('update')

    function updateEndSituation() {
        const positions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
            [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
        ];
        const isRowComplete = row => {
            const syms = row.map(i => model.board[i]).filter(Number.isInteger);
            return syms.length == 3
                && [0] == syms[1]
                && syms[1] == syms[2];
        };
        const isVictory = positions.map(isRowComplete).some(i => i === true);
        const isDraw = model.board.filter(Boolean).length === 9
        if (isVictory) {
            model.winner = model.players[model.turn];
        }
        if (isDraw) {
            model.draw = true;
        }
    }

    return model;
};

