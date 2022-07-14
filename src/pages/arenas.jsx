import React, {useMemo, useRef} from "react";
import './arenas.scss'
import socket, {useLoginUser, useSocket} from "service/socket";
import UserList from "components/user-list";
// import useTimer from "../helpers/timer-hook"
import {useAnimeManager, STAY, APPEAR, DISAPPEAR, SWAP} from "@perymimon/react-anime-manager";
import {Board} from "components/Board.jsx";
import {Player} from "components/User.jsx";

/*https://animxyz.com/*/

function handleRemove(arenaId) {
    socket.emit('remove-arena', arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas', [])
    const user = useLoginUser();
    const [arenasStates, traverse] = useAnimeManager(arenasId);

    // const isAppear = useAppear() || arenasId.length == 0;

    function handleChallenge(u1) {
        if (user.id === u1.id) return;
        socket.emit('challenge', u1)
    }

    const phase2class = {
        [STAY]: 'xyz-appear-nested',
        [APPEAR]: false ? 'xyz-appear' : 'xyz-in',
        [DISAPPEAR]: 'xyz-out',
        [SWAP]: 'xyz-out'
    }

    return (<tk-arenas xyz="fade-100% rotate-right-50% appear-stagger appear-stagger">
        {/* like : <Arena stage="LIST"></Arena> */}
        <tk-arena>
            <UserList onChallenge={handleChallenge}/>
        </tk-arena>
        {traverse(({item: id, phase, done}) => (
            <Arena id={id}
                   className={phase2class[phase]}
                   onAnimationEnd={done}
                   onRemove={handleRemove}/>
        ))}
    </tk-arenas>)

}

export const Arena = React.forwardRef(
    function Arena(props, ref) {
        const {onRemove, id, ...rest} = props;

        const [gameModel, gSocket] = useSocket(`game-${id}/update`, {id, stage: 'LOADING'})
        const [gameErrors] = useSocket(`game-${id}/game-errors`, [])
        const [usersList] = useSocket('users-list', []);

        const {stage, playersId} = gameModel;

        gameModel.players = useMemo(() => {
            return playersId?.map(pid => usersList.find(u => pid === u.id)) ?? []
        }, [playersId, usersList])

        function handleClick(event) {
            const cell = event.target;
            const cellNumber = cell.dataset.index;
            gSocket.emit('playerSelectCell', cellNumber)
        }

        const eventHandlers = {
            onCancel: () => gSocket.emit('cancel'),
            onApprove: () => gSocket.emit('approve'),
            onRemove: () => onRemove && onRemove(gameModel.id),
            onSelectTile: handleClick
        }
        const STAGE = {
            "INVITATION": Invitation,
            "GAME": Game,
            "END": Game,
            "CANCEL": Cancel,
            "LOADING": Loading
        }
        const Element = STAGE[stage];

        return (<tk-arena ref={ref} {...rest}>
            <Element {...gameModel} {...eventHandlers}  />
            {stage === "END" && <End {...gameModel} {...eventHandlers} />}
            <tk-errors>
                {gameErrors.map((e, i) => <tk-error key={e.id}>{e.text}</tk-error>)}
            </tk-errors>
        </tk-arena>)
    }
)


function Game({onSelectTile, players, board, turn, nextTurn, turnTime, stage}) {
    const marks = ['✗', '○'];
    const gameDom = useRef();
    const loginUser = useLoginUser();

    // const timer = useTimer(turnTime * 1000, 100, timer => {
    //     const dom = gameDom.current;
    //     var deg = 360 - timer.progress * 360;
    //     if (dom)
    //         dom.style.setProperty('--progress', `${deg}deg`);
    //
    // }, [turn])
    if (stage === "END") {
        // timer.stop(0, false);
    }


    return <tk-game ref={gameDom}>
        <menu className="competitors">
            <Player user={players[0]} mark={marks[0]} />
            <Player user={players[1]} mark={marks[1]} />
        </menu>

        <Board board={board} onSelectTile={onSelectTile}/>
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
        <Player user={user} nameView className="text-style-2"/>
        cancel the game
        <button className="button-style-1" onClick={onRemove}>OK</button>
    </tk-message>
}

function Invitation({players, onCancel, onApprove}) {
    const [by, against] = players;
    const loginUser = useLoginUser();

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
            {loginUser.id === against.id && invited}
            {loginUser.id === by.id && inviting}
        </tk-message>
    )
}

function Loading() {
    return <tk-message class="text-style-1"> Loading Arena </tk-message>
}