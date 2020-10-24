import EventEmitter from 'events'
import io from 'socket.io-client'


import uid from 'uid';

// localStorage.userId = (localStorage.userId ?? uid())
// // export const baseWSUrl = (ns) => `localhost:4000/${ns ? ns : '\r'}?uid=${localStorage.userId}`;
// const socket = io(baseWSUrl(), {autoConnect: false,})

const emitter = new EventEmitter()
export const {on, off} = emitter;

export let loginUser = {}
export let usersList = []
//
// socket.on('connect', function () {
//     console.log('server domain:', baseWSUrl());
// });
//
// socket.on('error', (error) => {
//     console.log(error);
// });
// socket.on('connect_error', (error) => {
//     console.log(error);
// });
// socket.on('connect_timeout', (timeout) => {
//     console.log(timeout);
// });
// socket.on('reconnect', (attemptNumber) => {
//     console.log(attemptNumber)
// });
// socket.on('disconnect', function () {
//     console.log('disconnect');
//
// });
//
// socket.on('user', function (user) {
//     debugger;
//     console.log('user data arrived');
//     loginUser = user;
//     emitter.emit('user', user)
// })
//
// socket.on('users-list', function (users) {
//     console.log('users-list data arrived');
//     debugger
//     usersList = users
//     emitter.emit('users-updated', users)
// })
// socket.on('arenas-list', function (arenas) {
//     emitter.emit('arenas-updated', arenas);
// })
//
// socket.connect(function () {
//     console.log('connect soccess')
//
// });
// socket.emit('hello', 42)