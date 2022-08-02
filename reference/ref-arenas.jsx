/*https://animxyz.com/*/

import React, {forwardRef, useMemo, useRef} from "react";
import '../src/pages/arenas.scss'
import socket, {useLoginUser, useSocket} from "src/service/socket";
// import useTimer from "../helpers/timer-hook"
import {useAnimeManager, STAY, APPEAR, DISAPPEAR, SWAP} from "@perymimon/react-anime-manager";
import {PlayerName} from "src/components/Player.jsx";
import {Game} from "src/components/Game.jsx";
import {Invitation} from "src/components/Invitation.jsx";
import {ChallengeBoard} from "src/components/ChallengeBoard";
import {Message} from "src/components/Message.jsx";
import {phase2xyz} from "src/helpers/xyz";
import useCssClass from "@perymimon/react-hooks/useCssClass";


function handleRemove(arenaId) {
    socket.emit('remove-arena', arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas', [])
    const user = useLoginUser();
    const [arenasStates, traverse] = useAnimeManager(arenasId, null, {skipPhases: [DISAPPEAR, SWAP]});

    function handleChallenge(u1) {
        if (user.id === u1.id) return;
        socket.emit('challenge', u1)
    }



    return (<tk-arenas xyz="appear-stagger">

        <ChallengeBoard onChallenge={handleChallenge}/>

        {traverse(({item: id, phase, done}) => (
            <Arena id={id}
                   className={phase2xyz(phase,'arena-appear','arena-in','arena-disappear')}
                   phase={phase}
                   onRemove={handleRemove}/>
        ))}
    </tk-arenas>)

}

export const Arena = forwardRef(
    function Arena(props, ref) {
        const {onRemove, id, className = "", ...rest} = props;

        const [gameModel, gSocket] = useSocket(`game-${id}/update`, {id, stage: 'LOADING'})
        const [gameErrors] = useSocket(`game-${id}/game-errors`, [])
        const [usersList] = useSocket('users-list', []);

        const {stage, playersId} = gameModel;

        gameModel.players = useMemo(() => {
            return playersId?.map(pid => usersList.find(u => pid === u.id)) ?? []
        }, [playersId, usersList])

        let classString = useCssClass({
          [className] : true,
        })

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

        return (<tk-arena ref={ref} class={classString} {...rest}>
            <Element {...gameModel} {...eventHandlers}  />
            {stage === "END" && <End {...gameModel} {...eventHandlers} />}
            <tk-errors>
                {gameErrors.map((e, i) => <tk-error key={e.id}>{e.text}</tk-error>)}
            </tk-errors>
        </tk-arena>)
    }
)


function End({winner, draw, onRemove, players}) {

    var message = useMemo(() => {
        if (draw) {
            return 'draw'
        } else {
            winner = players.find(p => p.id === winner);
            return `${winner.name} WIN`
        }
    }, [winner, draw, players])

    return <Message>
        <span>{message}</span>
        <button onClick={onRemove}>OK</button>
    </Message>

}

function Cancel({isCanceledBy, players, onRemove}) {
    const user = players.find(p => p.id === isCanceledBy);

    return <Message className="canceled">
        <PlayerName user={user}/>

        just canceled

        <button className="primary" onClick={onRemove}>Fine</button>
    </Message>
}


function Loading() {
    return <Message> Loading Arena </Message>
}