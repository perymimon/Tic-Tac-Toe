const {uid} = require('uid')
const AI = require('./ai')
const LetMap = require('./helpers/let-map');
const ReactiveSet = require('../src/helpers/reactive-set');
const ReactiveModel = require('../src/helpers/reactive-model');
const Arenas = require('./games');

module.exports =
    new class Users extends LetMap {
        create(name, useAI = false) {
            const user = new User(name)
            /** add new user to collection, it trigger `update` */
            this.set(user.id, user)
            /** proxy change from user model to Users */
            user.model.observe(() => this.emit(user.id, user))
            if (useAI) return new AI(user);

            return user;
        }

        list(withDisconnected = false) {
            const userModels = [...this.values()].map(u => u.model);
            return withDisconnected ?
                userModels:
                userModels.filter( m => m.disconnect == false)
        }
        delete(userId){
            const user = this.get(userId);
            super.delete(userId)
            // free possibles memory leaks
            user.arenas.unobserve();
            user.model.unobserve();
        }
        clearDisconnectUsers(){
            console.log('Activate Clear Disconnect Users ');
            const connected = [];
            const disconnected = [];
            /** get all connected && disconnected users **/
            for( let [id,user] of this){
                const set = user.model.disconnect? disconnected : connected;
                set.push(user)
            }
            /** from connected users extract all arenas. that is arena we need to keep **/
            const gameIds = [... new Set(connected.flatMap( user => [...user.arenas]))];
            /** extract all users on games **/
            const keepUsers = new Set(gameIds.flatMap( id=> Arenas.get(id).model.playersId));
            /** each disconnected users that not in keepUsers remove **/
            disconnected.forEach( user =>{
                if(! keepUsers.has(user.id)){
                    console.log(`${user.id} removed`)
                    this.delete(user.id);

                }
            })

        }

    }


class User {
    constructor(name) {
        this.id = uid();
        this.model = ReactiveModel({
            id: this.id,
            name,
            color: randomColor(),
            score: 0,
            disconnect: false
        })

        /* init arena set for this user */
        this.arenas = new ReactiveSet();
    }
    connect(){
        this.model.disconnect = false;
    }
    disconnect() {
        for (let gameId of this.arenas) {
            Arenas.get(gameId).cancel(this.id, true)
        }
        // this.arenas.clear();
        this.model.disconnect = true;
    }

}

var colorPool = "F44336,a15ead,a891d2,b38ef5,7279e4,03a9f4,00BCD4,11d4c2,4CAF50,8BC34A,cddc39,ffeb3b,ffc107,ff9800,ff5722".split(',');

function randomColor() {
    const {lastPoint = 0} = randomColor;
    var steps = (Math.random() * (colorPool.length / 2)) | 1;
    randomColor.lastPoint = (lastPoint + steps) % colorPool.length;
    var color = colorPool[randomColor.lastPoint];
    return '#' + color;
}
// /****************************************
//  * remove disconnected users every 15 min
//  * */
// setInterval(() => {
//     const users = module.exports;
//     for (let [key, user] of users) {
//         if (user.model.disconnect === true) {
//             users.delete(user.id)
//         }
//
//     }
// }, 60 * 1000)
