import {Manager} from 'socket.io-client';
import {useEffect, useLayoutEffect, useMemo, useState} from "react";
import LetMap from '../helpers/let-map'

const debug = require("debug")("socket")
const SOCKET_DOMAIN = process.env.REACT_APP_SOCKET_DOMAIN;
const manager = new Manager(SOCKET_DOMAIN, {
    reconnectionDelay: 10000,
    autoConnect: false,
    path: `/socket.io`,
    /* must add query here also because manger.socket() not move query on '/' ns */
    query: {
        uid: localStorage.userId
    }
});

/*
listen to all event under socket ns and update all hooks
* */
function eventWatcher({type, nsp, data}) {
    const [event, datum] = data;
    debug(`${event} event`, datum);
    console.log(event, nsp, datum)
    const nspEventKey = `${nsp}/${event}`;
    const setters = eventsHooks.get(nspEventKey)
    socketMemo[nspEventKey] = datum;
    setters.forEach(set => set(datum))
}

export function createSocket(namespace) {
    const query = {
        uid: localStorage.userId
    };
    const socket = manager.socket(namespace, {query})
    // must do for case userId updated after Manger connected
    socket.io.opts.query = query;
    socket.binary(false) /*performance*/
    socket.onevent = eventWatcher;
    socket.connect();
    return socket
}

const eventsHooks = new LetMap(new Set());
const sockets = new LetMap(ns => createSocket(ns))
const socketMemo = {};

const socket = window.socket = sockets.get('/')

export function useSocket(nspEvent, defaultValue) {
    const [nsp, key] = useMemo(() => {
        let [nsp, event] = nspEvent.split('/');
        [nsp, event] = event ? ['/' + nsp, event] : ['/', nsp];
        const key = [nsp, event].join('/');
        return [nsp, key]
    }, [nspEvent]);

    const [value, setValue] = useState(socketMemo[key] ?? defaultValue);
    useLayoutEffect(() => {
        const setters = eventsHooks.get(key)
        setters.add(setValue)
        return () => {
            setters.delete(setValue)
        }
    }, [key])
    return [socketMemo[key] ?? value, sockets.get(nsp)];
}

export function useLoginUser() {
    const [user] = useSocket('user', {});
    useLayoutEffect(() => {
        user.id && (localStorage.userId = user.id)
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
    }, []);
    return isConnected;
}

export default socket;