const uid = require('uid');
const LetMap = require('./helpers/let-map');
const ReactiveModel = require('../src/helpers/reactive-model');
const debug = require('debug')('arena')

const victoryScore = 100;
const lossScore = 0;
const tieScore = 10;

module.exports =
    new class Arenas extends LetMap {
        createGame(user1, user2, turnTime) {
            const game = new Game(user1.id, user2.id, turnTime);
            this.set(game.id, game);
            user1.arenas.add(game.id);
            user2.arenas.add(game.id);

            const nsp = this.io.of(`game-${game.id}`);
            debug(`created: namespace ${nsp.name}`)
            // const connected = new Set();
            // var deleteGameTimer = null;
            const get = (userid) =>   [user1,user2].find( u=> u.id === userid);
            nsp.on('connect', function connectSocket(socket) {
                // connected.add(socket)
                // clearTimeout(deleteGameTimer);
                //
                // socket.on('disconnect',()=>{
                //     connected.delete(socket)
                //     if(connected.size === 0 ){
                //         deleteGameTimer = setTimeout(()=>{
                //             this.delete(game.id);
                //         }, 60 * 1000);
                //     }
                // })

                // const userid = socket.handshake.query.uid;
                const userid = socket.client.request._query.uid;
                if (![user1.id, user2.id].includes(userid)) return;

                game.model.observe(model => {
                    const {stage,winner, loser, draw} = model;
                    if(['END','CANCEL'].includes(stage)){
                        if(draw){
                            user1.model.score += tieScore
                            user2.model.score += tieScore
                        }
                        if(winner){
                          get(winner).model.score += victoryScore;
                          get(loser).model.score += lossScore;
                        }
                    }

                    socket.emit('update', model)
                })
                game.errors.for(userid).observe(errors => {
                    socket.emit('game-errors', errors.map(eText=>({id:uid(),text:eText})));
                    setTimeout(_=> errors.length = 0)
                })
                socket.on('cancel', () => game.cancel(userid))
                socket.on('approve', () => game.approve(userid))
                socket.on('playerSelectCell', (number) => game.selectCell(userid, number));

            })

            return game;
        }

        list() {
            return [...this.values()];
        }

        attach(io) {
            this.io = io;
        }

    }

class Game {
    constructor(user1id, user2id, turnTime=5) {
        this.id = uid();
        this.model = ReactiveModel({
            id: this.id,
            playersId: [user1id, user2id],
            board: Array(9).fill(''),
            turn: 0,
            nextTurn:0,
            isStarted: false,
            isCanceled: false,
            turnTime,
            stage: 'INVITATION',
        })

        this.errors = new LetMap( userid => ReactiveModel([]))
    }

    cancel(userid, force= false) {
        const {model, turnTimer} = this;
        if (!force && model.stage === 'GAME') return;
        clearTimeout(turnTimer);
        model.isCanceledBy = userid;
        model.stage = 'CANCEL'
    }

    approve(userid) {
        const {model} = this;
        // just user2 can approve invention
        if (userid !== model.playersId[1]) return;
        model.isStarted = true;
        model.stage = 'GAME'
        nextPlayer.call(this);
    }

    selectCell(userid, cellNumber) {
        const {model, errors} = this;
        if(model.stage !== 'GAME') return;
        const {turn, playersId, board} = model;
        const userErrors = errors.for(userid);
        if (!model.isStarted || model.isCanceledBy)
            return userErrors.push(`game not started`)
        if (cellNumber < 0 && cellNumber > 8)
            return userErrors.push(`cell number ${cellNumber} is out of range`)
        if (userid !== playersId[turn])
            return userErrors.push('not your turn')
        if ([0, 1].includes(board[cellNumber])) {
            return userErrors.push('cell not empty')
        }
        board[cellNumber] = turn;
        const {isDraw, isVictory} = checkEndSituation(model);

        if(isVictory || isDraw){
            clearTimeout(this.turnTimer);
            model.stage = `END`;

            if (isVictory) {
                model.winner = playersId[turn];
                model.loser = playersId[(turn + 1) % 2];
            }
            if (isDraw) {
                model.draw = true;
            }
            return ;
        }

        nextPlayer.call(this);
    }
}
/* PRIVATE */
function nextPlayer(){
    const {model, turnTimer} = this;
    model.turn = model.nextTurn || 0;
    model.nextTurn = (model.turn + 1) % 2;

    clearTimeout(turnTimer);
    this.turnTimer = setTimeout(nextPlayer.bind(this), model.turnTime * 1000);

}

function checkEndSituation(model) {
    const {board} = model;
    const rows = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
    const isRowComplete = row => {
        const symbols = row.map(i => board[i]).filter(Number.isInteger).join('');
        return symbols === '111' || symbols === '000';
    };
    const isVictory = rows.map(isRowComplete).includes(true);
    const isDraw = !isVictory && board.filter(Number.isInteger).length === 9;
    return {isDraw, isVictory}
}