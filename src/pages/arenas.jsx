/*https://animxyz.com/*/

import React, {forwardRef, useMemo, useRef} from "react";
import './arenas.scss'
import socket, {useLoginUser, useSocket} from "service/socket";
import UserList from "components/user-list";
// import useTimer from "../helpers/timer-hook"
import {useAnimeManager, STAY, APPEAR, DISAPPEAR, SWAP} from "@perymimon/react-anime-manager";
import {Board} from "components/Board.jsx";
import {Player} from "components/Player.jsx";
import {Game} from "components/Game.jsx";
import {Invitation} from "components/Invitation.jsx";
import {ChallengeBoard} from "../components/ChallengeBoard";



function handleRemove(arenaId) {
    socket.emit('remove-arena', arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas', [])
    const user = useLoginUser();
    const [arenasStates, traverse] = useAnimeManager(arenasId, 'none',);

    function handleChallenge(u1) {
        if (user.id === u1.id) return;
        socket.emit('challenge', u1)
    }

    return (<tk-arenas xyz="fade-100% rotate-right-50% appear-stagger appear-stagger">
        {/* like : <Arena stage="LIST"></Arena> */}
        <tk-arena>
            <ChallengeBoard onChallenge={handleChallenge}/>
        </tk-arena>
        {traverse(({item: id, phase, done}) => (
            <Arena id={id}

                   onAnimationEnd={done}
                   onRemove={handleRemove}/>
        ))}
    </tk-arenas>)

}

export const Arena = forwardRef(
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


function Loading() {
    return <tk-message class="text-style-1"> Loading Arena </tk-message>
}