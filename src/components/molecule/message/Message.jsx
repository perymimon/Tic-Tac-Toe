import './message.scss'
import useCssClass from "@perymimon/react-hooks/css/useCssClass";
import useEventListener from "@perymimon/react-hooks/useEventListener";
import { useRef, forwardRef, useImperativeHandle } from "react";
import { useTimeout } from '@perymimon/react-hooks';

export const Message = forwardRef(
    function Message({ waiting, className = "", children, ...otherProps }, ref) {

        const classString = useCssClass({
            [className]: true,
        })
        const $message = useRef(null)
        useImperativeHandle(ref, () => $message.current);

        useIntervalClass($message, 10000, 'poke')

        return (
            <tk-message ref={$message} waiting={waiting} class={classString} {...otherProps}>
                {children}
            </tk-message>
        )
    }
)

/* helper */
function useIntervalClass(ref, time, className) {
    const { restart } = useTimeout(() => ref.current.classList.add(className), time)

    useEventListener('animationend', (event) => {
        // event.target.classList.remove(className)
        ref.current.classList.remove(className)
        restart();
    }, ref)

}
