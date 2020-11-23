import React, {useMemo, useRef} from "react";
import './arenas.scss'
import socket, {useLoginUser, useSocket} from "../service/socket";
import UserList, {User} from "../components/user-list";
import useTimer from "../helpers/timer-hook"



function handleRemove(arenaId) {
    socket.emit('remove-arena', arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas', [])
    const user = useLoginUser();

    function handleChallenge(u1) {
        if(user.id === u1.id) return ;
        socket.emit('challenge', u1)
    }
    return (<tk-arenas>
        {/* like : <Arena stage="LIST"></Arena> */}
        <tk-arena>
            <UserList onChallenge={handleChallenge}/>
        </tk-arena>
        {arenasId.map((id) => <Arena id={id}
                                     key={id}
                                     onRemove={handleRemove}/>)}
    </tk-arenas>)
}

const STAGE = {
    "INVITATION": Invitation,
    "GAME": Game,
    "END": Game,
    "CANCEL": Cancel,
    "LOADING": Loading
}

export function Arena({onRemove, ...initModel} = {}) {
    initModel.stage = 'LOADING';

    const [gameModel, gSocket] = useSocket(`game-${initModel.id}/update`, initModel)
    const [gameErrors] = useSocket(`game-${initModel.id}/game-errors`, [])
    const [usersList] = useSocket('users-list', []);

    const {stage, playersId} = gameModel;

    gameModel.players = useMemo(() => {
        if (!playersId) return []
        return playersId.map(pid => usersList.find(u => pid === u.id))
    }, [playersId, usersList])

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
    const Element = STAGE[stage];
    return (
        <tk-arena>
            <Element {...gameModel} {...eventHandlers}  />
            {stage === "END" && <End {...gameModel} {...eventHandlers} />}
            <tk-errors>
                {gameErrors.map( (e,i) => <tk-error key={e.id}>{e.text}</tk-error>)}
            </tk-errors>
        </tk-arena>
    )
}

function Game({onSelectTile, players, board, turn, nextTurn, turnTime, stage}) {
    const marks = ['✗', '○'];
    const gameDom = useRef();

    const timer = useTimer(turnTime * 1000, 100, timer => {
        const dom = gameDom.current;
        var deg = 360 - timer.progress * 360;
        if (dom)
            dom.style.setProperty('--progress', `${deg}deg`);

    }, [turn])
    if (stage === "END") {
        timer.stop(0, false);
    }
    return <tk-game ref={gameDom}>
        <div className="competitors">
            <User {...players[0]} mark={marks[0]} avatar/>
            <div className="time-out-marker">
                <User {...players[nextTurn]} mark={marks[nextTurn]} colorView/>
                <User {...players[turn]} mark={marks[turn]} colorView counterDown/>
            </div>
            <User {...players[1]} mark={marks[1]} avatar/>
        </div>
        <div className="board" style={{"--user-color":players[0].color}}>
            {Array.from({...board, length: 9}).map((turn, i) => {
                const style = {"--cell-color": players[turn || 0].color};
                const mark = marks[turn];
                return <div key={i}
                            data-index={i} style={style}
                            onClick={onSelectTile}>{mark}</div>
            })}
        </div>
    </tk-game>
}

function End({winner, draw, onRemove, players}) {
    winner = players.find(p => p.id === winner);
    var message;
    if (draw) {
        message = 'game end with draw'
    } else {
        message = `${winner.name} WIN`
    }

    return <tk-message>
        <span className="text-style-1">{message}</span>
        <button onClick={onRemove}>OK</button>
    </tk-message>

}

function Cancel({isCanceledBy, players, onRemove}) {
    const user = players.find(p => p.id === isCanceledBy);

    return <tk-message class="text-style-1">
        <User {...user} nameView className="text-style-2"/>
        cancel the game
        <button className="button-style-1" onClick={onRemove}>OK</button>
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