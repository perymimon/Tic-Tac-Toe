import {Manager} from 'socket.io-client';
import {useEffect, useLayoutEffect, useMemo, useState} from "react";
import LetMap from '../helpers/let-map'

const debug = require("debug")("socket")
const SOCKET_DOMAIN = process.env.REACT_APP_SOCKET_DOMAIN;
const manager = new Manager(SOCKET_DOMAIN, {
    reconnectionDelay: 10000,
    autoConnect: false,
    path: `/socket.io`,
});
window.addEventListener('storage', (...args) => {
    debugger;
    console.log('storage', args);
})

/*
listen to all event under socket ns and update all hooks
* */
function socketEventWatcher({type, nsp, data}) {
    const [event, datum] = data;
    debug(`${event} event`, datum);
    console.log(event, nsp, datum)
    const nspEventKey = `${nsp}/${event}`;
    const setters = eventsHooks.get(nspEventKey)
    socketMemo.set(nspEventKey, datum);
    setters.forEach(set => set(datum))
}

export function createSocket(namespace) {
    const uid = localStorage.userId;
    const socket = manager.socket(namespace, {query: {uid}})
    // must do for case userId updated after Manger connected
    socket.io.opts.query = {uid};
    socket.binary(false) /*performance*/
    socket.onevent = socketEventWatcher;
    socket.connect();
    return socket
}

const eventsHooks = new LetMap(new Set());
const sockets = new LetMap(ns => createSocket(ns))
const socketMemo = new LetMap(); // use it for the events

socketMemo.on('//user',function (user, oldUser){
    console.log('user',user);
    if(localStorage.userId !== user.id){
        localStorage.userId = user.id
        manager.opts.query.uid = user.id;
        manager.disconnect();
        manager.connect();
    }
})

const socket = window.socket = sockets.get('/')

export function useSocket(nspEvent, defaultValue) {
    const [nsp, key] = useMemo(() => {
        let [nsp, event] = nspEvent.split('/');
        [nsp, event] = event ? ['/' + nsp, event] : ['/', nsp];
        const key = [nsp, event].join('/');
        return [nsp, key]
    }, [nspEvent]);

    const [, setValue] = useState(/*just for trigger RENDER*/);
    useLayoutEffect(() => {
        const setters = eventsHooks.get(key)
        setters.add(setValue)
        return () => {
            setters.delete(setValue)
        }
    }, [key])
    return [socketMemo.get(key) ?? defaultValue, sockets.get(nsp)];
}

export function useLoginUser() {
    const [user] = useSocket('user', {});
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
    }, []);
    return isConnected;
}

export default socket;