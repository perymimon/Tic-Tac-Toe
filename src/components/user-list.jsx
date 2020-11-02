import {useSocket} from "../service/socket";
import "./users-list.scss"
import React from "react";

export default function UserList({onChallenge}) {
    const [usersList] = useSocket('users-list', [])

    return (
        <>
            <h4>challenge user</h4>
            <tk-users>
                {usersList.map(user => (
                    <User {...user} onClick={onChallenge} key={user.id}/>)
                )}
            </tk-users>
        </>
    )
}

export function User({name, score, color, mark, id, onClick, avatar}) {
    const style = {
        '--user-color': color ||'red',
        '--user-mark': mark
    }

    function handleClick(event) {
        onClick({name, id})
    }

    return (
        <tk-user style={style} avatar={avatar} onClick={handleClick}>
            <div className="color"></div>
            <div className="name">{name}</div>
            <div className="score">{score}</div>
        </tk-user>
    )
}
