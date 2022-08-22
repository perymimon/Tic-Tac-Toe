import './style.scss'

import { useRef } from "react"
import { useEventListener } from '@perymimon/react-hooks';

export function Debug() {
    var debuger = useRef();
    useEventListener('error', (e) => {
        debuger.innerHTML = JSON.stringify(e.message);
    })

    return (
        <div className="debug" ref={debuger}>


        </div>

    )

}