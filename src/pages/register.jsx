import './register.scss'
import React, {useEffect, useRef} from "react"
import socket from "../service/socket";


export default function RegisterPage(){
    const input = useRef();
    const button = useRef();

    useEffect(function (){
        if(!input.current) return
        const forceFocus = (event =>{
            if(event.path.includes(button.current)) return;
            input.current.focus()
        } );
        window.addEventListener('keydown',forceFocus)
        return _=> window.removeEventListener('keydown', forceFocus)
    },[])
    function handleSubmit(event){
        event.preventDefault();
        const form = event.target;
        const {playerName} = form.children;
        const name = playerName.value;
        // todo: send register command [name]
        socket.emit('user-register',{name})
    }
    return (<div className="register-form">
        <form onSubmit={handleSubmit}>
            <h5>Put Your Name</h5>
            <input autoFocus autoComplete="off" ref={input} minLength="2" maxLength="4" placeholder="2-4 letters" type="text" name="playerName" />
            <button ref={button}>Submit</button>
        </form>
    </div>)

}