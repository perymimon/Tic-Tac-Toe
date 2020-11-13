import {useSocket} from "../service/socket";
import "./users-list.scss"
import React from "react";

export default function UserList({onChallenge}) {
    const [usersList] = useSocket('users-list', [])

    return (
        <>
            <h4>challenge</h4>
            <tk-users>
                {usersList.map(user => (
                    <User {...user} showScore onClick={onChallenge} key={user.id}/>)
                )}
            </tk-users>
        </>
    )
}

export function User({name, score, color, mark, id, onClick, avatar,
                         showScore, tagView, colorView, nameView, AI}) {
    const style = {
        '--user-color': color || 'gray',
        '--user-mark': mark
    }

    function handleClick(event) {
        onClick({name, id})
    }
    const showName = !colorView;
    const showColor = !nameView;

    const user = (
        <tk-user style={style} avatar={avatar} nameView={nameView} AI={AI} onClick={handleClick}>
            {showColor && <div className="color"></div> }
            {showName && <div className="name">{name || ''}</div> }
            {showScore && <div className="score">{score}</div>}
        </tk-user>
    )

    return user;
}
