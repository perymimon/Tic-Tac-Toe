import {useLoginUser} from "../../../service/socket";
import './invitation.scss';
import {PlayerName} from "../../molecule/player/Player";
import {Message} from "../../molecule/message/Message";
import {useRun} from "@perymimon/react-hooks";

const INVITATION = "INVITATION", CANCEL = "CANCEL";

export function Invitation({gameModel, onApprove, onCancel, onRemove}) {
    const {stage, players, isCanceledBy} = gameModel;
    const [by, against] = players;
    const loginUser = useLoginUser();

    return (
        <tk-invitation>
            {useRun(() => {

                if (stage === INVITATION && loginUser.id === against.id) return (
                    /*  invited  */
                    <Message attention key={1}>
                        dual against <PlayerName user={by} className="user-inviting"/>
                        <button className="primary" onClick={onApprove}>approve</button>
                        <button className="secondary" onClick={onCancel}>decline</button>
                    </Message>
                )

                if (stage === INVITATION && loginUser.id === by.id) return (
                    /*  inviting  */
                    <Message waiting key={1}>
                        waiting to <PlayerName user={against} className="user-invited"/>
                        <button className="secondary" onClick={onCancel}>cancel</button>
                    </Message>
                )

                const player = players.find(p => p.id === isCanceledBy);
                if (stage === CANCEL) return (
                    /* cancel */
                    <Message className="canceled" key={1}>
                        <PlayerName user={player}/>

                        canceled

                        <button className="primary" onClick={onRemove}>Fine</button>
                    </Message>
                )
            }, [stage])}
        </tk-invitation>
    )

}

