import {forwardRef} from "react";
import {useSocket} from "../service/socket";
import useArrayToMap from "@perymimon/react-hooks/experiment/useArrayToMap";
import useCssClass from "@perymimon/react-hooks/useCssClass";
import {useRun} from "@perymimon/react-hooks";
import {Invitation} from "./Invitation";
import {Game} from "./Game";
import {Message} from "./Message";

export const Arena = forwardRef(
    function Arena(props, ref) {
        const {onRemove, id, className = "", style, ...rest} = props;

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
            "preserve-3d perspective": true,
        })

        var properties = {
            '--player-1-color': gameModel.players[0].color,
            '--player-2-color': gameModel.players[1].color,
            ...style
        }

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

        return (<tk-arena data-id={id} ref={ref} style={properties} class={classString} {...rest}>
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