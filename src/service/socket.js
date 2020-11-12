import {Manager} from 'socket.io-client';
import {useEffect, useLayoutEffect, useMemo, useState} from "react";
import LetMap from '../helpers/let-map'

const SOCKET_DOMAIN = process.env.REACT_APP_SOCKET_DOMAIN;
const manager = new Manager(SOCKET_DOMAIN, {
    reconnectionDelay: 10000,
    autoConnect: false,
    path: `/socket.io`,
});
/*
listen to all event under socket ns .
 save last value and update all register react hooks
* */
function socketEventWatcher({type, nsp, data}) {
    const [event, datum] = data;
    console.log(' Event Watcher', event, nsp, datum)
    const [,key] = nspEventKey(nsp,event);
    const setters = eventsHooks.for(key)
    socketMemo.set(key, datum);
    setters.forEach(set => set(datum))
}

function nspEventKey (nsp, event=''){
    let key = `${nsp}/${event}`
        .replace(/^\/*/,'/') // make it start with *one* /
        .replace(/\/*$/,'') // clear all / from the end
    const parts = key.split(/(?!^)\//) // split key to [/nsp,event]
    return parts.length === 1 ?['/',key]: [parts[0],key];
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
const socketMemo = new LetMap(); // use it for events

/* need to reconnect for query get place on the request*/
socketMemo.on('/user',function (user, oldUser){
    console.log('/user',user);
    if(localStorage.userId !== user.id){
        localStorage.userId = user.id
        manager.opts.query.uid = user.id;
        manager.disconnect();
        manager.connect();
    }
})

const socket = window.socket = sockets.for('/')

export function useSocket(nspEvent, defaultValue) {
    // nspEvent:string support 2 formats :
    // "nsp/event" - for register listener under event under custom ns
    // "event" - for register listener under default ns `/`

    const [nsp, key] = useMemo(() => nspEventKey(nspEvent), [nspEvent]);
    const [, setValue] = useState(/*just for we have a trigger RENDER*/);

    useLayoutEffect(() => {
        const setters = eventsHooks.for(key)
        setters.add(setValue)
        return () => {
            setters.delete(setValue)
        }
    }, [key])
    return [socketMemo.get(key) ?? defaultValue, sockets.for(nsp)];
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