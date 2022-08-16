import './style.scss'

import { useEffect, useRef } from "react"

export function Debug() {
    var debuger = useRef();

    useEffect(() => {
        window.addEventListener('error', event => {
            debugger;
            debuger.innerHTML = JSON.stringify(event);
        })
    })



    return (
        <div className="debug" ref={debuger}>


        </div>

    )

}