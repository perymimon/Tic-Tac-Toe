const uid = require('uid')
const usersMap = new Map();
const users$arenaMap = new WeakMap();

var colorPool = "F44336,9C27B0,673AB7,3F51B5,2196f3,03a9f4,00BCD4,009688,4CAF50,8BC34A,cddc39,ffeb3b,ffc107,ff9800,ff5722".split(',');
const EventEmitter = require('events');
const emitter = new EventEmitter();

var lastpoint = 0;

function randomColor() {
    var steps = (Math.random() * (colorPool.length / 2)) | 1;
    // var color = colorPool.splice(i, 1)[0];
    lastpoint = (lastpoint + steps) % colorPool.length;
    var color = colorPool[lastpoint];
    return '#' + color;
}

Object.assign(module.exports, {
    get, create, getUsersList, getArenas, addArena, removeArena,
    on: emitter.on.bind(emitter)
})

function get(id) {
    return usersMap.get(id);
}

function create(name) {
    const user = {
        id: uid(),
        name,
        color: randomColor(),
        score: 0,
    }
    usersMap.set(user.id, user)
    users$arenaMap.set(user, new Set())
    emitter.emit('update')
    return user;
}

function getArenas(user) {
    return users$arenaMap.get(user)
}

function addArena(user1, user2, arenaid) {
    user1 = String(user1) === user1 ? get(user1) : user1;
    user2 = String(user2) === user2 ? get(user2) : user2;
    emitter.emit('arenas-updated', {
        [user1.id]:getArenas(user1).add(arenaid),
        [user2.id]:getArenas(user2).add(arenaid)
    })
}

function removeArena(user1, user2, arenaid) {
    const updated = {}
    for( let u of [user1,user2]){
        if(!u) continue;
        const arenas = getArenas(Object(u) === u ? u: get(u));
        arenas.delete(arenaid);
        updated[u.id] = arenas
    }
    emitter.emit('arenas-updated', updated)

}

function getUsersList() {
    const users = [...usersMap].map(pair => pair[1])
    return users;
}