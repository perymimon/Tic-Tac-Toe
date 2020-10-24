import io from 'socket.io-client';
import {useEffect, useState} from "react";
// import uid from 'uid';

// const allReadyRegister = !!localStorage.userId
// localStorage.userId = (localStorage.userId ?? uid())
const debug = require("debug")("socket")
const SOCKET_DOMAIN = process.env.REACT_APP_SOCKET_DOMAIN;
export const socketUrl = (ns) => `${SOCKET_DOMAIN}${ns ? '/' + ns : ''}?uid=${localStorage.userId || ''}`;
const url = socketUrl()
console.log('socket url:', url)
const socket = io(url, {autoConnect: false});
// piggyback using the event-emitter bundled with socket.io client
var patch = require('socketio-wildcard')(io.Manager);
patch(socket);

window.socket = socket;

export function createSocket(namespace) {
    return io(socketUrl(namespace))
}

socket.on('*', function(...attrs){
    console.log(...attrs)
})

const socketSetters = {};
const socketMemo = {};

export function igniteSocketListener(event) {
    socketSetters[event] = new Set();
    socket.on(event, function (data) {
        const setters = socketSetters[event];
        socketMemo[event] = data;
        debug(`${event} event`, data);
        [...setters].forEach(setter => setter(data))

    });
}

export function useSocket(event, defaultValue) {
    const [value, setValue] = useState(socketMemo[event] ?? defaultValue);
    useEffect(() => {
        const setters = socketSetters[event];
        if(!setters)
            igniteSocketListener(event);

        setters.add(setValue)

        return () => {
            setters.delete(setValue)
        }
    }, [event])
    return socketMemo[event] ?? value
}

// export function useSocket(event, defaultValue) {
//     const [value, setValue] = useState(defaultValue);
//     useEffect(() => {
//         const update = (data) => {
//             setValue(data)
//         }
//         socket.on(event, update);
//         return () => {
//             socket.off(event, update)
//         }
//     }, [event])
//     return value
// }

// /*todo: find a general listener */
// function memSocketData(event) {
//     socket.on(event, function (data) {
//         memo[event] = data;
//     });
// }
//
//
//
// // const memoCount ={}
// export function useSocketStream(event, defaultValue) {
//     const value = useSocket(event, memo[event] || defaultValue)
//     useEffect(() => {
//         memo[event] = value;
//     }, [value])
//     return value;
// }

export function useLoginUser() {
    const user = useSocket('user', {});
    useEffect(() => {
        localStorage.userId = user.id
    }, [user.id])
    return user;
}

export function useIsConnected() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    useEffect(() => {

        socket.on('connect', () => {
            setIsConnected(true);
        });
        socket.on('disconnect', () => {
            setIsConnected(false);
        });
        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    });
    return isConnected;
}

socket.connect();

export default socket;