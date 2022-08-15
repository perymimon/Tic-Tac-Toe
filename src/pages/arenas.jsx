/*https://animxyz.com/*/

import './arenas.scss'
import socket, {useLoginUser, useSocket} from "service/socket";
import {useAnimeManager} from "@perymimon/react-anime-manager";
import {ChallengeBoard} from "components/organism/challenge-board/ChallengeBoard";
import {noBubble} from "@perymimon/js-tools-belt";

import {Arena} from "components/organism/arena/Arena.jsx"

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

    return (<tk-arenas>

        <ChallengeBoard onChallenge={handleChallenge}/>

        {traverse(({item: id, phase, done}, {isMove, dx, dy}) => {
            var className = dy !== 0 ? 'between-lines' : '';

            return <Arena id={id} className={className}
                          isMove={isMove}
                          style={{'--dx': dx, '--dy': dy,}}
                          phase={phase}
                          onAnimationEnd={noBubble(done)}
                          onRemove={handleRemove}/>
        })}
    </tk-arenas>)

}