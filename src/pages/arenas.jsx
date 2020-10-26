import React from "react";
import './arenas.scss'
import './arenas-users-list.scss'
import socket, {useSocket} from "../service/socket";
import UserList,{User} from "../components/user-list";

function handleChallenge(user){
    socket.emit('challenge',user)
}
function handleRemove(arenaId){
    socket.emit('remove-arena',arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas'  ,[]  )
    return (<tk-arenas>
        {arenasId.map((id) => <Arena id={id}
                                     key={id}
                                     onRemove={handleRemove}/>)}
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
    initModel.stage = 'LOADING';

    const [gameModel,gSocket] = useSocket(`game-${initModel.id}/update`,initModel)

    function handleClick(event) {
        const cell = event.target;
        const cellNumber = cell.dataset.index;
        gSocket.emit('playerSelectCell', cellNumber)

    }

    function handleApprove() {
        gSocket.emit('approve')
    }

    function handleCancel() {
        gSocket.emit('cancel')
    }

    const eventHandlers = {
        onCancel: handleCancel,
        onApprove: handleApprove,
        onRemove: ()=>onRemove && onRemove(gameModel.id),
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

    return (
        <tk-invantion>
            {localStorage.userId === by.id ? inviting : invited}
        </tk-invantion>
    )
}

function Loading(){
    return <div className="message"> Loading Arena </div>
}