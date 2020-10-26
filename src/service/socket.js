import {Manager} from 'socket.io-client';
import {useEffect, useLayoutEffect, useMemo, useState} from "react";

class LetMap extends Map {
    constructor(struct) {
        super();
        this.initStruct(struct);
    }

    initStruct(struct) {
        this.struct = struct;
    }

    get(k) {
        if (!super.has(k)) {
            const {struct} = this;
            const s = typeof struct == 'function' ?
                struct(k) :
                new struct.constructor(struct)
            super.set(k, s)
        }
        return super.get(k);
    }
}

const debug = require("debug")("socket")
const SOCKET_DOMAIN = process.env.REACT_APP_SOCKET_DOMAIN;
const manager = new Manager(SOCKET_DOMAIN, {
    reconnectionDelay: 10000,
    autoConnect: true,
    path: `/socket.io`,
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
    manager.opts.query.uid= localStorage.userId;
    const socket = manager.socket(namespace)
    socket.binary(false) /*performance*/
    socket.onevent = eventWatcher;
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
    }, []);
    return isConnected;
}

manager.connect();

export default socket;