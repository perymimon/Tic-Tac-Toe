import 'index.scss';

import React from 'react';

import * as serviceWorker from './serviceWorker';
import App from './app/App';
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import { Debug } from 'components/organism/debug';

import supportedBrowsers from './supportedBrowsers.js';


const rootContainer = document.getElementById('root');
const root = createRoot(rootContainer);

if (!supportedBrowsers.test(navigator.userAgent)) {
    alert('Your browser is not supported.');
    // var href = location.href.replace(/https?/, 'googlechrome')
    var href = `intent${window.location.href.replace(/https?/, '')};scheme=https;package=com.android.chrome;end`
    root.render(
        <div>
            Your browser is not supported.
            click <a href={href} target="_blank" rel="noreferrer">here</a> to open it on chrome
        </div>
    )
} else {

    // <React.StrictMode>
    root.render(
        <>
            <BrowserRouter>
                <App />
            </BrowserRouter>
            <Debug />
        </>
    )
    // </React.StrictMode>

}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
