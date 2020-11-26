import {useLoginUser, useSocket} from "../service/socket";
import "./users-list.scss"
import React, {useState} from "react";
import ToggleButton from "./toggle-button";

export default function UserList({onChallenge}) {
    const [usersList] = useSocket('users-list', [])
    const user = useLoginUser();
    const [showTop, setShowTop] = useState('top10', true)
    const amountOfTop = 10;

    var showList = usersList.filter((u1)=> u1.id !== user.id);
    if (showTop) {
        showList = usersList.slice(0, amountOfTop)
            .sort((u1, u2) => u2.score - u1.score);
    }

    return (
        <>
            <h4>challenge</h4>
            <tk-users decorationText={showTop?"top10":""}>
                {showList.map(user => (
                    <User {...user}
                          showScore
                          onClick={onChallenge}
                          key={user.id}/>)
                )}
            </tk-users>
            <ToggleButton onInput={setShowTop} defaultValue={showTop}>
                top 10
            </ToggleButton>
        </>
    )
}


export function User({
     name, score, color, mark, id, onClick, avatar, disconnect,
     showScore, tagView, colorView, nameView, AI, counterDown,
                }) {
    const style = {
        '--user-color': color || 'gray'
    }
    if(disconnect){
        style.filter = "opacity(0.5) grayscale(.9)";
    }
    function handleClick(event) {
        onClick && onClick({name, id})
    }

    const showName = !colorView;
    const showColor = !nameView;

    const user = (
        <tk-user mark={mark} style={style} avatar={avatar} time={counterDown} nameView={nameView} AI={AI}
                 onClick={handleClick}>
            {showColor && <div className="color"></div>}
            {showName && <div className="name">{name || ''}</div>}
            {showScore && <div className="score">{score}</div>}
        </tk-user>
    )

    return user;
}
