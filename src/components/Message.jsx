import './message.scss'
import useCssClass from "@perymimon/react-hooks/useCssClass";

export function Message({waiting,className, children, ...otherProps}) {
    const classString = useCssClass({
        [className]: true,
    })

    return (
        <tk-message waiting={waiting} class={classString} {...otherProps}>
            {children}
        </tk-message>
    )
}