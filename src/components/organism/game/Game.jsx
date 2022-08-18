import './index.scss'
import { useEffect, useRef, useState, useCallback } from "react";
import { Player, PlayerCover, PlayerName, PlayerTag } from "components/molecule/player/Player";
import { Board } from "components/molecule/board/Board";
import { Message } from "components/molecule/message/Message";
import { noAnimBubble } from "helpers/helpers.js";
import { useInterval, useRun, useTimeout, useTimingsStages } from "@perymimon/react-hooks";
import useCssClass from "@perymimon/react-hooks/css/useCssClass";
import { useLoginUser } from "service/socket";
import { rotate } from "@perymimon/js-tools-belt";
import { StopWatch } from "components/molecule/stop-watch/StopWatch";
import { Button } from "components/molecule/button/button";
import { If } from 'components/molecule/If';

const END = "END";

/*
* <Game>
* */
export function Game({ gameModel, onRemove, onSelectTile }) {
    const { players, board, turn, turnTime, stage, id, winner, draw } = gameModel;
    const gameDom = useRef();
    const [showSplash, setSplash] = useState(true);
    const loginUser = useLoginUser();

    const rotateIndex = players.findIndex(p => p.id === loginUser.id);
    const rPlayers = rotate(players, rotateIndex);
    const rotateTurn = (turn + rotateIndex) % players.length;

    useTimingsStages(gameDom, [3400]) // use to set css states for flow anime

    const classString = useCssClass({
        "game-over": stage === END,
        "player-1": rotateTurn === 0,
        "player-2": rotateTurn === 1,
        "draw": draw,
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
    // 
    return (
        <>
            <tk-game ref={gameDom} class={classString} style={properties}>
                {/* <If show={stage !== END} hidedelay={2000} name="menu"> */}
                <menu className="competitors" >
                    {useRun(() => {
                        const winnerCls = rPlayers[0].id == winner ? ' winner' : '';
                        return <PlayerCover
                            user={rPlayers[0]} class={`player-1`}
                            coverClass={winnerCls} />
                    })}
                    <StopWatch />
                    <span className="vs">VS</span>
                    {useRun(() => {
                        const winnerCls = rPlayers[1].id == winner ? ' winner' : '';
                        return <PlayerCover user={rPlayers[1]}
                            class="player-2"
                            coverClass={`rtl ${winnerCls}`} />
                    })}

                </menu>
                {/* </If> */}

                <Board board={board} onSelectTile={onSelectTile} />
                <div className="game-id">{id}</div>
                <If show={stage === END} showdelay={900} name="end">
                    <End model={gameModel} gameRef={gameDom} onRemove={onRemove} />
                </If>
            </tk-game>
            <SplashScreen show={stage !== END && showSplash} gameModel={gameModel}
                onAnimationEnd={noAnimBubble('xyz-out-keyframes', _ => setSplash(false))} />


        </>
    )
}
/*
* <SplashScreen>
* ***********************/
function SplashScreen({ gameModel, show, onAnimationEnd, gameRef, ...otherProp }) {
    const { players } = gameModel;

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
                xyz="inherit left-100% skew-left-2 wide-25%" />
            <span className="xyz-nested">VS</span>
            <PlayerName user={players[1]} className="player-2 xyz-nested"
                xyz="inherit right-100% skew-right-2 wide-25%" />
        </Message>
    )
}

/*
* <End> 
**************/
function End({ model, onRemove, gameRef, ...otherProp }) {
    var { draw, winner, prize = 100 } = model;
    var prizeRef = useRef(null);

    var currentScore = useCallback((score) => {
        var elm = gameRef.current.querySelector('.winner dd[name="score"]');
        score && (elm.innerText = score);
        return Number(elm.innerText);

    })

    var newScore = useRun(() => {
        if (!gameRef.current) return [0, 0]
        return currentScore() + prize;
    }, [gameRef.current])


    var {clear, restart} = useInterval(() => {
        var num = currentScore();
        if (num >= newScore) { clear(); return }
        currentScore(num + 1);
    }, 10,{autoStart:false});
    useTimeout(restart, 800)

    var message = draw ? 'draw' : 'Winner !';

    return (
        <div className='game-over-anotation'>
            <div className='message'>{message}</div>
            <div ref={prizeRef} className="prize">+{prize}</div>
            <Button onClick={onRemove} className="primary">Fine</Button>
        </div>
    )
}
