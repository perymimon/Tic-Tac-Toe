import './button.scss'
import {forwardRef, useImperativeHandle, useRef} from "react";
import useEventListener from "@perymimon/react-hooks/useEventListener";

export const Button = forwardRef(
    function Button({children, onClick, ...otherProps}, ref) {

        const internalRef = useRef();
        useImperativeHandle(ref, () => internalRef.current);

        useEventListener('animationend', function (event) {
            event.animationName === 'button-active' && onClick()
        },internalRef)

        return (
            <button onClick={onClick} ref={internalRef} {...otherProps}>{children}</button>
        )
    }
)