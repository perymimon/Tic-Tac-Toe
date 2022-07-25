import {useLoginUser} from "../service/socket";
import './invitation.scss';
import {PlayerName} from "./Player";
import {Message} from "./Message";
import {useRun} from "@perymimon/react-hooks";

const INVITATION = "INVITATION", CANCEL = "CANCEL";

export function Invitation(props) {
    const {stage} = props.gameModel;

    return (
        <tk-invitation>
            {useRun(() => {
                if (stage === INVITATION) return <HandShake {...props}  />
                if (stage === CANCEL) return <Cancel {...props} />;
            }, [stage])}
        </tk-invitation>
    )

}


function HandShake({gameModel, onApprove, onCancel}) {
    const {players} = gameModel;
    const [by, against] = players;
    const loginUser = useLoginUser();

    /*  invited  */
    if (loginUser.id === against.id) {
        return (
            <Message attention>
                dual against <PlayerName user={by} className="user-inviting"/>
                <button className="primary" onClick={onApprove}>approve</button>
                <button className="secondary" onClick={onCancel}>decline</button>
            </Message>
        )
    }

    /*  inviting  */
    if (loginUser.id === by.id) {
        return (
            <Message waiting>
                waiting to <PlayerName user={against} className="user-invited"/>
                <button className="secondary" onClick={onCancel}>cancel</button>
            </Message>
        )
    }
}

function Cancel({gameModel, onRemove}) {
    const {isCanceledBy, players} = gameModel;
    const user = players.find(p => p.id === isCanceledBy);

    return <Message className="canceled">
        <PlayerName user={user}/>

        just canceled

        <button className="primary" onClick={onRemove}>Fine</button>
    </Message>
}
