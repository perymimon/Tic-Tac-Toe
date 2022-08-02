import React, {useEffect} from 'react';
import './App.scss';
import Register from './pages/register';
import Arenas from './pages/arenas.jsx'
import {isDev} from './helpers/environment.js';
import ConnectionSVG from './images/connect2.inline.svg'
import {
    Routes,
    Route,
    useNavigate
} from "react-router-dom";

import {useConnected, useLoginUser} from "./service/socket"
import {PlayerName} from "./components/Player";

function App() {
    const user = useLoginUser()
    const isConnected = useConnected();
    let navigate  = useNavigate();
    useEffect(_=>{
        navigate(user.id ? "/" : "/register", '');
    },[user.id])

    const connectionStyle = {
        ...isConnected ? {} : {filter: 'grayscale(1)'}
    }
    const env = isDev?'(dev)':'';
    return (
        <div className="App">
            <header className="app-header introduce-finish">
                {user.id ? <PlayerName user={user} /> :<span/>}
                Tic Tac Toe {env}
                <span className="connection-icon" title={isConnected?"socket connected":"socket disconnected"}/>
            </header>
            <main className="introduce-finish">
                <Routes>
                    <Route exact path="/register" element={<Register/>} />
                    <Route index element={<Arenas/>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;


// CSS.registerProperty({
//     name: '--degrees',
//     syntax: '<angle>',
//     inherits: false,
//     initialValue: 'blue',
// });