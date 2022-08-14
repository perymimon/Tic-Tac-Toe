import './App.scss';
import React, {useEffect} from 'react';

import Register from 'pages/register';
import Arenas from 'pages/arenas.jsx'
import {Header} from "components/organism/header/header";

import {Route, Routes, useNavigate} from "react-router-dom";

import {useLoginUser} from "service/socket"

function App() {

    const user = useLoginUser()
    const navigate = useNavigate();

    useEffect(_ => {
        navigate(user.id ? "/" : "/register", '');
    }, [user.id, navigate])


    return (
        <tk-app>
            <Header />
            <main className="introduce-finish">
                <Routes>
                    <Route exact path="/register" element={<Register/>}/>
                    <Route index element={<Arenas/>}/>
                </Routes>
            </main>
        </tk-app>
    );
}

export default App;