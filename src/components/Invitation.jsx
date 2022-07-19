import {useLoginUser} from "../service/socket";

import './invitation.scss';
import {PlayerName} from "./Player";
import {Message} from "./Message";

export function Invitation({players, onCancel, onApprove}) {
    const [by, against] = players;
    const loginUser = useLoginUser();

    const invited = (
        <Message waiting>
            dual against <PlayerName user={by} className="user-inviting"/>
            <button className="primary" onClick={onApprove}>approve</button>
            <button className="secondary" onClick={onCancel}>decline</button>
        </Message>
    )

    const inviting = (
        <Message waiting>
            waiting to <PlayerName user={against} className="user-invited"/>
            <button className="secondary" onClick={onCancel}>cancel</button>
        </Message>
    )

    return (
        <tk-invitation>
            {loginUser.id === against.id && invited}
            {loginUser.id === by.id && inviting}
        </tk-invitation>
    )
}
