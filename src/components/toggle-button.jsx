import "./toggle-button.scss"
import uid from 'uid'
import React,{useState} from "react";

export default function ToggleButton({onInput, defaultValue=false, children}) {
    const [id] = useState(_=>uid())
    const [checked, setChecked] = useState(!!defaultValue)

    function handleInput(event) {
        // const v = event.target.checked;
        const v = !checked;
        onInput && onInput(v);
        setChecked(v)
    }

    return <toggle-buttn>
        <input type="checkbox" id={id} checked={checked} onChange={handleInput}/>
        <label for={id}></label>{children}
    </toggle-buttn>
}