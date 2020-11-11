const uid = require('uid')
const EventEmitter = require('events');
const letMap = require('../src/helpers/let-map');
const ReactiveModel = require('../src/helpers/reactive-model');

const usersMap = new letMap();
const users$arenaMap = new WeakMap();

var colorPool = "F44336,9C27B0,673AB7,3F51B5,2196f3,03a9f4,00BCD4,009688,4CAF50,8BC34A,cddc39,ffeb3b,ffc107,ff9800,ff5722".split(',');
const emitter = new EventEmitter();


/* emit every time userMap add or update record */
usersMap.on('update',()=> emitter.emit('update'))

function randomColor() {
    const {lastPoint=0} = randomColor;
    var steps = (Math.random() * (colorPool.length / 2)) | 1;
    // var color = colorPool.splice(i, 1)[0];
    randomColor.lastPoint =  (lastPoint + steps) % colorPool.length;
    var color = colorPool[randomColor.lastPoint];
    return '#' + color;
}

Object.assign(module.exports, {
    get, create, getUsersList, getArenas, addArena, removeArena,
    on: emitter.on.bind(emitter)
})

function get(id) {
    return usersMap.get(id);
}

function getUsersList() {
    return [...usersMap.values()];
}

function create(name) {
    const user = ReactiveModel({
        id: uid(),
        name,
        color: randomColor(),
        score: 0,
    })
    /*proxy change to trigger `update` on UserMap*/
    user.observe((model) => usersMap.emit(user.id))
    /* add new user to collection, it trigger `update` */
    usersMap.set(user.id, user)
    /*init arena set for this user */
    users$arenaMap.set(user, new Set())

    return user;
}

function getArenas(user) {
    return users$arenaMap.get(user)
}

function addArena(user1id, user2id, arenaid) {
    const user1 = get(user1id);
    const user2 = get(user2id);

    emitter.emit('arenas-updated', {
        [user1.id]: getArenas(user1).add(arenaid),
        [user2.id]: getArenas(user2).add(arenaid)
    })
}

function removeArena(user1id, arenaid) {
    const arenas = getArenas(get(user1id));
    arenas.delete(arenaid);
    emitter.emit('arenas-updated', {
        [user1id]: arenas
    })

}

