/*https://animxyz.com/*/

import React, {forwardRef, useMemo} from "react";
import './arenas.scss'
import socket, {useLoginUser, useSocket} from "service/socket";
// import useTimer from "../helpers/timer-hook"
import {useAnimeManager, STAY, APPEAR, DISAPPEAR, SWAP} from "@perymimon/react-anime-manager";
import {Game} from "components/Game.jsx";
import {Invitation} from "components/Invitation.jsx";
import {ChallengeBoard} from "components/ChallengeBoard";
import {Message} from "components/Message.jsx";
import {phase2xyz} from "helpers/xyz";
import useCssClass from "@perymimon/react-hooks/useCssClass";
import {useRun} from "@perymimon/react-hooks";
import {noBubble} from "../helpers/no-bubble-helper";
import useArrayToMap from "@perymimon/react-hooks/experiment/useArrayToMap";


function handleRemove(arenaId) {
    socket.emit('remove-arena', arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas', [])
    const user = useLoginUser();

    const [arenasStates, traverse] = useAnimeManager(arenasId, null, {skipPhases: []});

    function handleChallenge(u1) {
        if (user.id === u1.id) return;
        socket.emit('challenge', u1)
    }

    // var animationClass = phase2xyz(phase, 'arena-appear', 'arena-in', 'arena-disappear')

    return (<tk-arenas class="preserve-3d perspective">

        <ChallengeBoard onChallenge={handleChallenge}/>

        {traverse(({item: id, phase, done}, {isMove, dx, dy}) => {
            const properties = {
                '--dx': dx,
                '--dy': dy,
            };
            return <Arena id={id}
                          isMove={isMove}
                          style={properties}
                          phase={phase}
                          onAnimationEnd={noBubble(done)}
                          onRemove={handleRemove}/>
        })}
    </tk-arenas>)

}


export const Arena = forwardRef(
    function Arena(props, ref) {
        const {onRemove, id, className = "", ...rest} = props;

        const [gameModel, gSocket] = useSocket(`game-${id}/update`, {id, stage: 'LOADING'})
        const [gameErrors] = useSocket(`game-${id}/game-errors`, [])
        const [usersList] = useSocket('users-list', []);

        const userMap = useArrayToMap(usersList, 'id')

        const {stage, playersId = []} = gameModel;

        gameModel.players = [{
            ...userMap.get(playersId[0]),
            class: "player-1"
        }, {
            ...userMap.get(playersId[1]),
            class: "player-2"
        }]

        let classString = useCssClass({
            [className]: true,
        })

        const eventHandlers = {
            onCancel: () => gSocket.emit('cancel'),
            onApprove: () => gSocket.emit('approve'),
            onRemove: () => {
                onRemove && onRemove(gameModel.id)
            },
            onSelectTile: (event) => {
                const cell = event.target;
                const cellNumber = cell.dataset.index;
                gSocket.emit('playerSelectCell', cellNumber)
            }
        }

        const STAGE = useRun(() => {
            if (["INVITATION", "CANCEL"].includes(stage))
                return Invitation;
            if (["GAME", "END"].includes(stage))
                return Game;
            if (["LOADING"].includes(stage))
                return Loading
        }, [stage])

        return (<tk-arena data-id={id} ref={ref} class={classString} {...rest}>
            <STAGE gameModel={gameModel} {...eventHandlers}  />
            <tk-errors>
                {gameErrors.map((e, i) => <tk-error key={e.id}>{e.text}</tk-error>)}
            </tk-errors>
        </tk-arena>)
    }
    )

        function Loading() {
            return (
                <Message>
                    Loading Arena
                </Message>
            )
        }