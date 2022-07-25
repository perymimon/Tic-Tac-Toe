import './message.scss'
import useCssClass from "@perymimon/react-hooks/useCssClass";
import useTimeout from "@perymimon/react-hooks/useTimeout";
import {useEffect, useRef} from "react";

export function Message({waiting,className="", children, ...otherProps}) {
    const classString = useCssClass({
        [className]: true,
    })
    const $message = useRef(null)

    // useIntervalClass($message,10000, 'poke')

    return (
        <tk-message ref={$message} waiting={waiting} class={classString} {...otherProps}>
            {children}
        </tk-message>
    )
}

function useIntervalClass(ref, time, className){
    const {reset} = useTimeout(()=>ref.current.classList.add(className), time)
    useEventListener('animationend',(event)=> {
        // event.target.classList.remove(className)
        ref.current.classList.remove(className)
        reset();
    }, ref)
}

export function useEventListener(eventName, handler, element = window) {
    const savedHandler = useRef(handler);
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);


    useEffect(() => {
        const dom = 'current' in element? element.current : element;
        if (dom == null) return;
        const handler = e => savedHandler.current(e);
        dom.addEventListener(eventName, handler);

        return () => dom.removeEventListener(eventName, handler);
    }, [eventName, element, element?.current])

}
