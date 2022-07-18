import './game.scss'
import React, {useRef} from "react";
import {useLoginUser} from "../service/socket";
import {PlayerCover} from "./Player";
import {Board} from "./Board";

export function Game({onSelectTile, players, board, turn, nextTurn, turnTime, stage}) {
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
      <PlayerCover user={players[0]} class="player-1" mark={marks[0]} />
      <PlayerCover user={players[1]} class="player-2" mark={marks[1]} />
    </menu>

    <Board board={board} onSelectTile={onSelectTile}/>
  </tk-game>
}
