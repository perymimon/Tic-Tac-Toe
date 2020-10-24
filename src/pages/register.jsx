import './register.scss'
import React,{} from "react"
import socket from "../service/socket";


export default function RegisterPage(){

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
            <input autoFocus placeholder="2 letter or more" type="text" name="playerName" />
            <button>Submit</button>
        </form>
    </div>)

}