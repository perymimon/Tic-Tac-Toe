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
    var href1 = window.location.href.replace(/https?/, 'googlechrome')
    var href2 = `intent${window.location.href.replace(/https?/, '')};scheme=https;package=com.android.chrome;end`
    root.render(
        <div className='no-supported-banner'>
           <h1>   Your browser is not supported. </h1>
            <p>this app desing to work on chrome only.</p>
            <p>
                try click <a href={href1}>here</a> or <a href={href2} target="_blank" rel="noreferrer">here </a> 
                 to move to  Chrome
            </p> 
            <image href="images/screanshot-18.001.png" />
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
