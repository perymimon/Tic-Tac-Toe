import './index.scss'
import { useEffect, useRef, useState, useCallback } from "react";
import { Player, PlayerCover, PlayerName, PlayerTag } from "components/molecule/player/Player";
import { Board } from "components/molecule/board/Board";
import { Message } from "components/molecule/message/Message";
import { noAnimBubble } from "helpers/helpers.js";
import { useInterval, useLatest, useRun, useTimeout, useTimingsStages } from "@perymimon/react-hooks";
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
    var { players, board, turn, turnTime, stage, id } = gameModel;
    var { draw, winner } = gameModel.stageMeta;
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
                            player={rPlayers[0]} class={`player-1`}
                            coverClass={winnerCls} />
                    })}
                    <StopWatch />
                    <span className="vs">VS</span>
                    {useRun(() => {
                        const winnerCls = rPlayers[1].id == winner ? ' winner' : '';
                        return <PlayerCover player={rPlayers[1]}
                            class="player-2"
                            coverClass={`rtl ${winnerCls}`} />
                    })}

                </menu>
                {/* </If> */}

                <Board board={board} onSelectTile={onSelectTile} players={players} />
                <div className="game-id">{id}</div>
                <If show={stage === END} showdelay={900} name="end">
                    <End model={gameModel} gameRef={gameDom} onRemove={onRemove} />
                </If>
            </tk-game>
            <SplashScreen show={stage !== END && showSplash} gameModel={gameModel}
                // <SplashScreen gameModel={gameModel}
                onSplashEnd={_ => setSplash(false)} />


        </>
    )
}
/*
* <SplashScreen>
* ***********************/
function SplashScreen({ gameModel, show = true, onSplashEnd, gameRef, ...otherProp }) {
    const { players } = gameModel;
    const ref = useRef();

    useTimeout(() => onSplashEnd?.(), 5000, { autoStart: show })
    useTimeout(() => ref.current.classList.replace('xyz-in', 'xyz-out'), 2000, { autoStart: show })

    if (!show) return null;

    // function handleAnimationEnd(evt) {
    //     if (evt.animationName === 'xyz-in-keyframes')
    //         evt.target.classList.add('xyz-out')
    // }

    return (
        <Message ref={ref} className="vs-annotation-message xyz-in"
            xyz="fade " {...otherProp}
        >
            <PlayerName player={players[0]} className="player-1 xyz-nested"
                xyz="inherit skew-left-2 wide-25%" />
            <span className="xyz-nested">VS</span>
            <PlayerName player={players[1]} className="player-2 xyz-nested"
                xyz="inherit skew-right-2 wide-25%" />
        </Message>
    )
}

/*
* <End> 
**************/
function score(ref, newScore) {
    var elm = ref.current.querySelector('.winner dd[name="score"]');
    newScore && (elm.innerText = newScore);
    return Number(elm.innerText);
}

function End({ model, onRemove, gameRef, ...otherProp }) {
    var { draw, winner, winnerOldScore, winnerNewScore } = model.stageMeta;
    var { victoryPrize } = model.setting;
    var prizeRef = useRef(null);

    var init = useCallback(() => {
        score(gameRef, winnerOldScore);
    }, []);

    var { clear } = useInterval(() => {
        const num = score(gameRef)
        if (num >= winnerNewScore) { clear(); return }
        score(gameRef, num + 1);
    }, 10, { delay: 800, init, autoStart: !draw });


    var message = draw ? 'draw' : 'Winner !';

    var classString = useCssClass('game-over-anotation', {
        "winner": winner,
        "draw": draw,
    })
    return (
        <div className={classString}>
            <div className='message'>{message}</div>
            <div ref={prizeRef} className="prize">+{victoryPrize}</div>
            <Button onClick={onRemove} className="primary">Fine</Button>
        </div>
    )
}


