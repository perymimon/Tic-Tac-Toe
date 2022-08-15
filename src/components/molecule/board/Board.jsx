import './board.scss';

import useSound from 'use-sound';
import chessSfx from 'assets/sound/chess-pieces.mp3';
// import {useAnimeManager} from "@perymimon/react-anime-manager";
import {useEffect} from "react";

const xyzTileEntrance = "perspective-5 origin-left front-5 stagger-0.5 fade-100% duration-5 big-3"

export function Board(props) {
    const {board, onSelectTile} = props;
    const [play] = useSound(chessSfx, {
        sprite: {
            sound0: [21187, 250],
            sound1: [1100, 400],
            sound2: [2500, 400],
            sound3: [5600, 320],
            sound4: [8100, 300],
            sound5: [18740, 300]
        },
    });
    // const [, transitions] = useAnimeManager(board, 'index'); // todo: implement update phase

    useEffect(() => {
        var i = Math.floor(Math.random() * 5);
        play({id: `sound${i}`});
    }, [board, play]);

    return (
        <tk-board xyz={xyzTileEntrance}>
            {board.map((playerIndex, index) => {

                return <tk-tile key={index}
                                data-player={String(playerIndex)}
                                data-index={index}
                                onClick={onSelectTile}/>

            })}
        </tk-board>
    )

}