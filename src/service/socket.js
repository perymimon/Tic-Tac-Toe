import io from 'socket.io-client';
import { useLayoutEffect, useMemo, useState } from "react";
// import LetMap from '../helpers/let-map'
import { LetMap } from '@perymimon/let-map'

/** enable Verbose on devtool logs to see that logs*/
import debuggers from 'debug'

const debug = debuggers("socket");
/**********************************
listen to all event under socket ns .
 save last value and update all register react hooks
 /************************************/
function socketEventWatcher({ type, nsp, data }) {
    const [event, datum] = data;
    debug('Event Watcher', event, nsp, datum)
    const [, key] = nspEventKey(nsp, event);
    const setters = eventsHooks.let(key)
    socketMemo.set(key, datum);
    setters.forEach(set => set(datum))
}

function nspEventKey(nsp, event = '') {
    let key = `${nsp}/${event}`
        .replace(/^\/*/, '/') // force it start with one /
        .replace(/\/*$/, '') // clear all / at the end
    const parts = key.split(/(?!^)\//) // split key to [/nsp,event]
    return parts.length === 1 ? ['/', key] : [parts[0], key];
}

function createSocket(namespace) {
    const uid = localStorage.userId;
    const SOCKET_DOMAIN = process.env.REACT_APP_SOCKET_DOMAIN;
    const socket = io(SOCKET_DOMAIN + namespace, {
        autoConnect: false,
        query: { uid },
        transports: ['websocket'],
        extraHeaders: {
            'Access-Control-Allow-Origin': "*"
        }
    })
    socket.onevent = socketEventWatcher;
    socket.connect();
    return socket
}

const eventsHooks = new LetMap(new Set());
const sockets = new LetMap(ns => createSocket(ns))
const socketMemo = new LetMap(); // use it for events

/* need to reconnect for query get place on the request*/
socketMemo.on('/user', function ({ key, value: user }) {
    debug('/user', user);
    if (localStorage.userId !== user.id) {
        localStorage.userId = user.id
        // socket.io.disconnect()
        // socket.io.connect();
    }
})

const socket = window.socket = sockets.let('/')

export function useSocket(nspEvent, defaultValue) {
    /*****************
        @nspEvent:string support 2 formats
        "nsp/event" - for register listener under event under custom ns
        "event"     - for register listener under default ns `/`
     */
    const [nsp, key] = useMemo(() => nspEventKey(nspEvent), [nspEvent]);
    const [, forceRender] = useState(/*just for we have a trigger RENDER*/);

    useLayoutEffect(() => {
        const setters = eventsHooks.let(key);
        setters.add(forceRender);
        return () => setters.delete(forceRender)
    }, [key])
    return [socketMemo.get(key) ?? defaultValue, sockets.let(nsp)];
}

export function useLoginUser() {
    const [user] = useSocket('user', {});
    const isConnected = useConnected();
    user.disconnect = !isConnected
    return user;
}

export function useConnected() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    useLayoutEffect(() => {
        socket.on('connect', set);
        socket.on('disconnect', set);

        function set() {
            setIsConnected(socket.connected);
        }
        if (socket.connected !== isConnected) {
            set()
        }

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
        // eslint-disable-next-line
    }, []);
    return socket.connected;
}

export default socket;