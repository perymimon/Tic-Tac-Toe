const uid = require('uid')
const AI = require('./ai')
const LetMap = require('../src/helpers/let-map');
const ReactiveSet = require('../src/helpers/reactive-set');
const ReactiveModel = require('../src/helpers/reactive-model');

var colorPool = "F44336,9C27B0,673AB7,3F51B5,2196f3,03a9f4,00BCD4,009688,4CAF50,8BC34A,cddc39,ffeb3b,ffc107,ff9800,ff5722".split(',');

function randomColor() {
    const {lastPoint = 0} = randomColor;
    var steps = (Math.random() * (colorPool.length / 2)) | 1;
    randomColor.lastPoint = (lastPoint + steps) % colorPool.length;
    var color = colorPool[randomColor.lastPoint];
    return '#' + color;
}

class User {
    constructor(name) {
        this.id = uid();
        this.model = ReactiveModel({
            id: this.id,
            name,
            color: randomColor(),
            score: 0,
        })

        /* init arena set for this user */
        this.arenas = new ReactiveSet();
    }
}


class Users extends LetMap{
    create(name, useAI = false) {
        const user = new User(name)
        /* add new user to collection, it trigger `update` */
        this.set(user.id, user)
        this.emit('new-user', user);

        if (useAI) {
            return new AI(user);
        }
        return user;
    }

    list() {
        return [...this.values()].map(u => u.model);
    }

}

module.exports = new Users();
