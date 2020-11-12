const uid = require('uid')
const Users = require('./users')
const ReactiveModel = require('../src/helpers/reactive-model');
const arenaMap = new Map();
const EventEmitter = require('events');
const emitter = new EventEmitter();
const victoryScore = 100;
const lossScore = -1;

/* module exports */
Object.assign(module.exports, {
    get, Arena, getList, attach,
    on: emitter.on.bind(emitter)
})
var io = null;

function attach(_io) {
    io = _io;
}

function get(id) {
    return arenaMap.get(id);
}

function getList() {
    return [...arenaMap.values()];
}

function Arena(user1id, user2id) {
    const game = new Game(user1id, user2id);
    arenaMap.set(game.id, game)

    const nsp = io.of(`game-${game.id}`);
    console.log(`created: namespace ${nsp.name}`)

    nsp.on('connect', function connectSocket(socket) {
        game.observe(model => {
            socket.emit('update', model)
        })
        game.error(errors=>{
            socket.emit('game-errors', errors);
            errors.length = 0;
        })

        const userid = socket.handshake.query.uid || null;
        if (![user1id, user2id].includes(userid)) return;

        socket.on('cancel', () => game.cancel(userid))
        socket.on('approve', () => game.approve(userid))
        socket.on('playerSelectCell', (number)=>game.selectCell(userid,number));

    })

    return game;

}

class Game {
    constructor(user1id, user2id) {

        const model = this.model = ReactiveModel({
            id: uid(),
            playersId: [user1id, user2id
                // Users.get(user1id).model,
                // Users.get(user2id).model
            ],
            board: Array(9).fill(''),
            turn: 0,
            isStarted: false,
            isCanceled: false,
            stage: 'INVITATION'
        })

        this.id = model.id;
        this.errors = ReactiveModel([]);

    }

    observe(cb) {
        this.model.observe(cb);
    }
    error(cb){
        this.errors.observe(cb);
    }
    cancel(userid) {
        const {model} = this;
        if (model.stage === 'GAME') return;
        model.isCanceledBy = userid;
        model.stage = 'CANCEL'
    }

    approve(userid) {
        const {model} = this;
        // just user2 can approve invention
        if (userid !== model.playersId[1]) return;
        model.isStarted = true;
        model.stage = 'GAME'
    }

    selectCell(userid, cellNumber) {
        const {model,errors} = this;
        const {turn,playersId, board} = model;
        if (!model.isStarted || model.isCanceledBy)
            return errors.push( `game not started`)
        if (cellNumber < 0 && cellNumber > 8)
            return errors.push(`cell number ${cellNumber} is out of range`)
        if (userid !== playersId[turn])
            return errors.push( 'not your turn')

        board[cellNumber] = turn;
        const {isDraw, isVictory} = checkEndSituation(model);

        if(isVictory){
            model.winner = Users.get(playersId[turn]);
            model.loser = Users.get(playersId[(turn + 1) % 2]);
            model.stage = `END`
            model.winner.score += victoryScore;
            model.loser.score += lossScore;
            return;
        }
        if(isDraw){
            model.draw = true;
            model.stage = `END`
            return ;
        }
        model.turn = (model.turn + 1) % 2
    }
}

function checkEndSituation(model) {
    const {board} = model;
    const positions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
    const isRowComplete = row => {
        const symbols = row.map(i => board[i]).filter(Number.isInteger).join('');
        return symbols === '111' || symbols === '000';
    };
    const isVictory = positions.map(isRowComplete).includes(true);
    const isDraw = !isVictory && board.filter(Number.isInteger).length === 9;
    return {isDraw, isVictory}
}