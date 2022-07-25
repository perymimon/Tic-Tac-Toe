import './game.scss'
import {useState, useRef} from "react";
import {PlayerCover, PlayerName} from "./Player";
import {Board} from "./Board";
import {Message} from "./Message";

const END = "END";

/*
* <Game>
* */
export function Game({gameModel, onRemove, onSelectTile}) {
    const {players, board, turn, nextTurn, turnTime, stage} = gameModel;
    const marks = ['✗', '○'];
    const gameDom = useRef();
    const [showSplash, setSplash] = useState(true);

    return (
        <>
            <tk-game ref={gameDom}>
                <menu className="competitors">
                    <PlayerCover user={players[0]} class="player-1" mark={marks[0]}/>
                    <PlayerCover user={players[1]} class="player-2" mark={marks[1]}/>
                </menu>

                <Board board={board} onSelectTile={onSelectTile}/>
            </tk-game>

            <SplashScreen show={showSplash} gameModel={gameModel}/>

            <End show={stage === END} gameModel={gameModel} onRemove={onRemove}/>

        </>
    )
}

/*
* <SplashScreen>
* */

function SplashScreen({gameModel, show, onAnimationEnd, ...otherProp}) {
    const {players} = gameModel;

    if(!show) return null;

    function handleAnimationEnd(evt) {
        if (evt.animationName === 'xyz-in-keyframes') {
            evt.target.classList.add('xyz-out')
        } else {
            onAnimationEnd?.();
        }
    }

    return (
        <Message className="vs-annotation-message xyz-in"
                 onAnimationEnd={handleAnimationEnd}
                 xyz="fade  out-delay-10 duration-10 out-delay-10" {...otherProp}
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
* <End>
* */
function End({gameModel, show, onRemove, ...otherProp}) {
    if(!show) return null;

    var {draw, winner, players} = gameModel;

    var wonPlayer = players.find(p => p.id === winner);
    var message = draw && 'draw' || `${wonPlayer.name} Won`;

    return (
        <Message {...otherProp}>
            <span>{message}</span>
            <button onClick={onRemove}>OK</button>
        </Message>
    )
}