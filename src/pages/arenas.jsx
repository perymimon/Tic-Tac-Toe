import React, {useEffect, useState} from "react";
import './arenas.scss'
import './arenas-users-list.scss'
import socket, {createSocket, useSocket} from "../service/socket";
import UserList,{User} from "../components/user-list";

function handleChallenge(user){
    socket.emit('challenge',user)
}

export default function Arenas() {
    const arenasId = useSocket('arenas'  ,[]  )
    return (<tk-arenas>
        {arenasId.map((id) => <Arena id={id} key={id} />)}
        {/*<Arena stage="LIST"></Arena>*/}
        <tk-arena>
            <UserList onChallenge={handleChallenge}/>
        </tk-arena>
    </tk-arenas>)
}

const STAGE = {
    "INVITATION": Invitation,
    "GAME": Game,
    "END": End,
    "CANCEL": Cancel,
    "LOADING": Loading
}

export function Arena({onRemove, ...initModel} = {}) {
    debugger
    const [gsocket] = useState(()=> createSocket('game-' + initModel.id))
    const [gameModel, setGameModel] = useState({
        stage:'LOADING',
        ...initModel
    })
    useEffect(() => {
        // return () => socket.disconnect();
        gsocket.on('update', model => setGameModel(model));
        gsocket.connect();
    },[gsocket])

    function handleClick(event) {
        const cell = event.target;
        const cellNumber = cell.dataset.index;
        gsocket.emit('playerSelectCell', cellNumber)

    }

    function handleApprove() {
        gsocket.emit('approve')
    }

    function handleCancel() {
        gsocket.emit('cancel')
    }

    const eventHandlers = {
        onCancel: handleCancel,
        onApprove: handleApprove,
        onRemove: onRemove,
        onSelectTile: handleClick
    }
    const Element = STAGE[gameModel.stage];
    return (
        <tk-arena>
            <Element {...gameModel} {...eventHandlers}  />
        </tk-arena>
    )
}

function Game({onSelectTile, players}) {
    const user1 = players[0];
    const user2 = players[1];

    return <div className="game">
        <div className="competitors">
            <User {...user1} avatar/>
            <User {...user2} avatar/>
        </div>
        <div className="board">
            <div data-index="0" onClick={onSelectTile}>board[0]</div>
            <div data-index="1" onClick={onSelectTile}>board[1]</div>
            <div data-index="2" onClick={onSelectTile}>board[2]</div>
            <div data-index="3" onClick={onSelectTile}>board[3]</div>
            <div data-index="4" onClick={onSelectTile}>board[4]</div>
            <div data-index="5" onClick={onSelectTile}>board[5]</div>
            <div data-index="6" onClick={onSelectTile}>board[6]</div>
            <div data-index="7" onClick={onSelectTile}>board[7]</div>
            <div data-index="8" onClick={onSelectTile}>board[8]</div>
        </div>
    </div>
}

function Cancel({isCanceledBy, players, onRemove}) {
    const user = players.find(p => p.id === isCanceledBy);
    return <div className="message">
        <span>{user.name} cancel the game</span>
        <button onClick={onRemove}>OK</button>
    </div>
}

function End({winner, draw, onRemove}) {
    var message;
    if (draw) {
        message = 'game end with draw'
    } else {
        message = `${winner.name} WIN`
    }

    return <div className="message">
        <span>{message}</span>
        <button onClick={onRemove}>OK</button>
    </div>

}

function Invitation({players, onCancel, onApprove}) {
    const by = players[0];
    const against = players[1];

    const invited = (
        <div className="invited">
            {by.name} challenge You to dual against him
            <button onClick={onCancel}>approve</button>
            <button onClick={onApprove}>decline</button>
        </div>
    )

    const inviting = (
        <div className="inviting">
            waiting to {against.name}
            <button onClick={onCancel}>cancel</button>
        </div>
    )
    const loginUser = useSocket('user', {})

    return (
        <tk-invantion>
            {loginUser.id === by.id ? inviting : invited}
        </tk-invantion>
    )
}

function Loading(){
    return <div className="message"> Loading Arena </div>
}