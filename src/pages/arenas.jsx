import React, {useMemo} from "react";
import './arenas.scss'
import socket, {useSocket} from "../service/socket";
import UserList, {User} from "../components/user-list";

function handleChallenge(user) {
    socket.emit('challenge', user)
}

function handleRemove(arenaId) {
    socket.emit('remove-arena', arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas', [])
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

    const [gameModel, gSocket] = useSocket(`game-${initModel.id}/update`, initModel)

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
        onRemove: () => onRemove && onRemove(gameModel.id),
        onSelectTile: handleClick
    }
    const Element = STAGE[gameModel.stage];
    return (
        <tk-arena>
            <Element {...gameModel} {...eventHandlers}  />
        </tk-arena>
    )
}

function Game({onSelectTile, players, board, turn}) {
    const [usersList] = useSocket('users-list', []);
    let [_players, marks] = useMemo(() => {
        return [
            players.map(p => usersList.find(u => u.id === p.id)),
            {[0]: '✗', [1]: '○'}
        ]
    }, [players, usersList])
    return <tk-game>
        <div className="competitors">
            <User {..._players[0]} mark={marks[0]} avatar/>
            <User {..._players[turn]} mark={marks[turn]} colorView/>
            <User {..._players[1]} mark={marks[1]} avatar/>
        </div>
        <div className="board">
            {Array.from({...board, length: 9}).map((turn, i) => {
                const style = {"--user-color": _players[turn || 0].color};
                const mark = marks[turn];
                return <div key={i}
                            data-index={i} style={style} onClick={onSelectTile}>{mark}</div>
            })}
        </div>
    </tk-game>
}

function Cancel({isCanceledBy, players, onRemove}) {
    const user = players.find(p => p.id === isCanceledBy);
    
    return <tk-message class="text-style-1">
        <User {...user} nameView className="text-style-2"/>
        cancel the game
        <button className="button-style-1" onClick={onRemove}>OK</button>
    </tk-message>
}

function End({winner, draw, onRemove}) {
    var message;
    if (draw) {
        message = 'game end with draw'
    } else {
        message = `${winner.name} WIN`
    }

    return <tk-message>
        <span class="text-style-1">{message}</span>
        <button onClick={onRemove}>OK</button>
    </tk-message>

}

function Invitation({players, onCancel, onApprove}) {
    const by = players[0];
    const against = players[1];

    const invited = (
        <>
            dual with {by.name} ?
            <button onClick={onApprove}>approve</button>
            <button onClick={onCancel}>decline</button>
        </>
    )

    const inviting = (
        <>
            waiting to {against.name}
            <button onClick={onCancel}>cancel</button>
        </>
    )

    return (
        <tk-message class="text-style-1">
            {localStorage.userId === against.id && invited}
            {localStorage.userId === by.id && inviting}
        </tk-message>
    )
}

function Loading() {
    return <tk-message class="text-style-1"> Loading Arena </tk-message>
}