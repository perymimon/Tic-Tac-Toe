import './board.scss';

const xyzTileEntrance = "perspective-5 origin-left front-5 stagger-0.5 fade-100% duration-5 big-3"

export function Board(props) {
    const { board, onSelectTile } = props;

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