/*https://animxyz.com/*/

import './arenas.scss'
import socket, {useLoginUser, useSocket} from "service/socket";
// import useTimer from "../helpers/timer-hook"
import {useAnimeManager} from "@perymimon/react-anime-manager";
import {ChallengeBoard} from "components/ChallengeBoard";
import {noBubble} from "../helpers/no-bubble-helper";

import {Arena} from "components/Arena.jsx"

function handleRemove(arenaId) {
    socket.emit('remove-arena', arenaId)
}

export default function Arenas() {
    const [arenasId] = useSocket('arenas', [])
    const user = useLoginUser();

    const [, traverse] = useAnimeManager(arenasId, null, {skipPhases: []});

    function handleChallenge(u1) {
        if (user.id === u1.id) return;
        socket.emit('challenge', u1)
    }

    // var animationClass = phase2xyz(phase, 'arena-appear', 'arena-in', 'arena-disappear')

    return (<tk-arenas class="">

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