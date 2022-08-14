import './game.scss'
import {useEffect, useRef, useState} from "react";
import {PlayerCover, PlayerName} from "components/molecule/player/Player";
import {Board} from "components/molecule/board/Board";
import {Message} from "components/molecule/message/Message";
import {noAnimBubble} from "helpers/helpers.js";
import {useTimingsStages} from "@perymimon/react-hooks";
import useCssClass from "@perymimon/react-hooks/css/useCssClass";
import {useLoginUser} from "service/socket";
import {rotate} from "@perymimon/js-tools-belt";
import {StopWatch} from "components/molecule/stop-watch/StopWatch";

const END = "END";

/*
* <Game>
* */
export function Game({gameModel, onRemove, onSelectTile}) {
    const {players, board, turn, turnTime, stage} = gameModel;
    const gameDom = useRef();
    const [showSplash, setSplash] = useState(true);
    const loginUser = useLoginUser();

    const rotateIndex = players.findIndex(p => p.id === loginUser.id);
    const rotationPlayers = rotate(players, rotateIndex);
    const rotateTurn = (turn + rotateIndex) % players.length;

    useTimingsStages(gameDom, [3400]) // use to set css states for flow anime

    const classString = useCssClass({
        "game-end": stage === END,
        "player-1": rotateTurn === 0,
        "player-2": rotateTurn === 1,
    })
    const properties = {
        '--turn-time': turnTime,
        '--turn': rotateTurn
    }

    useEffect(() => {
        gameDom.current.getAnimations()
            .filter(a => a.animationName === 'timeout')
            .forEach(a => {
                a.cancel();
                a.play()
            })
    }, [rotateTurn]);

    return (
        <>
            <tk-game ref={gameDom} class={classString} style={properties}>
                <menu className="competitors">
                    <PlayerCover user={rotationPlayers[0]} class="player-1"/>
                    <StopWatch/>
                    <span className="vs">VS</span>
                    <PlayerCover user={rotationPlayers[1]} class="player-2" coverClass="rtl"/>
                </menu>

                <Board board={board} onSelectTile={onSelectTile}/>
            </tk-game>
            <SplashScreen show={showSplash} gameModel={gameModel}
                          onAnimationEnd={noAnimBubble('xyz-out-keyframes', _ => setSplash(false))}/>

            <End show={stage === END} gameModel={gameModel} onRemove={onRemove}/>

        </>
    )
}

/*
* <SplashScreen>
* */

function SplashScreen({gameModel, show, onAnimationEnd, ...otherProp}) {
    const {players} = gameModel;

    if (!show) return null;

    function handleAnimationEnd(evt) {
        if (evt.animationName === 'xyz-in-keyframes') {
            evt.target.classList.add('xyz-out')
        } else {
            onAnimationEnd?.(evt);
        }
    }

    return (
        <Message className="vs-annotation-message xyz-in"
                 onAnimationEnd={handleAnimationEnd}
                 xyz="fade out-delay-10 duration-10 out-delay-10" {...otherProp}
        >
            <PlayerName user={players[0]} className="player-1 xyz-nested"
                        xyz="inherit left-100% skew-left-2 wide-25%"/>
            <span className="xyz-nested">VS</span>
            <PlayerName user={players[1]} className="player-2 xyz-nested"
                        xyz="inherit right-100% skew-right-2 wide-25%"/>
        </Message>
    )
}

/*
* <End> */
function End({gameModel, show, onRemove, ...otherProp}) {
    if (!show) return null;

    var {draw, winner, players} = gameModel;

    var wonPlayer = players.find(p => p.id === winner);
    var message = draw ? 'draw' : `${wonPlayer.name} Won`;

    return (
        <Message className="game-end" {...otherProp}>
            <span>{message}</span>
            <button onClick={onRemove}>OK</button>
        </Message>
    )
}