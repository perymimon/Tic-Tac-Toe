import React, {useEffect} from 'react';
import './App.scss';
import Register from './pages/register';
import Arenas from './pages/arenas'
import ConnectionSVG from './images/connect2.inline.svg'
import {
    Switch,
    Route,
    useHistory
} from "react-router-dom";

import {useIsConnected, useLoginUser} from "./service/socket"

function App() {
    const user = useLoginUser()
    const isConnected = useIsConnected();
    let history = useHistory();
    useEffect(_=>{
        history.push(user.id ? "/" : "/register", '');
    },[history,user.id])

    const connectionStyle = {
        ...isConnected ? {} : {filter: 'grayscale(1)'}
    }
    return (
        <div className="App">
            <header className="app-header introduce-finish">
                <span className="place-holder"></span>
                Tick Tac Toe
                <span className="connection-icon" title={isConnected?"socket connected":"socket disconnected"}>
                 <ConnectionSVG style={connectionStyle}/>
                </span>
                {/*<button onClick={sendMessage} >send message</button>*/}
            </header>
            <main className="introduce-finish">
                <Switch>
                    <Route exact path="/register">
                        <Register/>
                    </Route>
                    <Route path="/">
                        <Arenas/>
                    </Route>
                </Switch>
            </main>
        </div>
    );
}

export default App;
