const uid = require('uid')
const EventEmitter = require('events');
const AI = require('./ai')
const letMap = require('../src/helpers/let-map');
const ReactiveSet = require('../src/helpers/reactive-set');
const ReactiveModel = require('../src/helpers/reactive-model');
var colorPool = "F44336,9C27B0,673AB7,3F51B5,2196f3,03a9f4,00BCD4,009688,4CAF50,8BC34A,cddc39,ffeb3b,ffc107,ff9800,ff5722".split(',');
const emitter = new EventEmitter();

function randomColor() {
    const {lastPoint = 0} = randomColor;
    var steps = (Math.random() * (colorPool.length / 2)) | 1;
    randomColor.lastPoint = (lastPoint + steps) % colorPool.length;
    var color = colorPool[randomColor.lastPoint];
    return '#' + color;
}

class User {
    // static arenasSym = Symbol('arena')
    constructor(name) {
        const model = this.model = ReactiveModel({
            id: uid(),
            name,
            color: randomColor(),
            score: 0,
        })
        this.id = model.id;

        /* init arena set for this user */
        const arenas = new ReactiveSet();
        users$arenaMap.set(this, arenas)
    }

    observeModel(cb) {
        this.model.observe(cb);
    }

    observeArenas(cb) {
        this.arenas.observe(cb);
    }

    get arenas() {
        return users$arenaMap.get(this);
    }

    addArena(arenaId) {
        const {arenas} = this;
        arenas.add(arenaId);
    }

    removeArena(arenaId) {
        const {arenas} = this;
        arenas.delete(arenaId);

    }
}


const usersMap = new letMap();
const users$arenaMap = new WeakMap();

/* emit every time userMap add or update record */
usersMap.on('update', () => emitter.emit('update'))


class Users {
    static create(name, useAI = false) {
        const user = new User(name)
        /* add new user to collection, it trigger `update` */
        usersMap.set(user.id, user)

        /*proxy `update` to UserMap, for make user.score reflect*/
        user.observeModel(model => usersMap.emit(model.id));
        user.observeArenas(() => emitter.emit('arenas-updated', user.id, user.arenas))

        emitter.emit('new-user', user);
        // emitter.emit('arenas-updated',this.id, arenas);
        if (useAI) {
            return new AI(user);
        }
        return user;
    }

    static list() {
        return [...usersMap.values()].map(u => u.model);
    }

    static get(userId) {
        return usersMap.get(userId);
    }

    static addArena(userId, arenaId) {
        const user = Users.get(userId);
        user.addArena(arenaId);
    }

    static on() {
        return emitter.on(...arguments)
    }

    static removeArena(userId, arenaId) {
        const user = Users.get(userId);
        user.removeArena(arenaId);
    }
}

module.exports = Users;
