import './message.scss'
import useCssClass from "@perymimon/react-hooks/css/useCssClass";
import useEventListener from "@perymimon/react-hooks/useEventListener";
import useTimeout from "@perymimon/react-hooks/useTimeout";
import {useRef} from "react";

export function Message({waiting,className="", children, ...otherProps}) {
    const classString = useCssClass({
        [className]: true,
    })
    const $message = useRef(null)

    useIntervalClass($message, 10000, 'poke')

    return (
        <tk-message ref={$message} waiting={waiting} class={classString} {...otherProps}>
            {children}
        </tk-message>
    )
}

/* helper */
function useIntervalClass(ref, time, className){
    const {reset} = useTimeout(()=>ref.current.classList.add(className), time)

    useEventListener('animationend',(event)=> {
        // event.target.classList.remove(className)
        ref.current.classList.remove(className)
        reset();
    }, ref)

}
