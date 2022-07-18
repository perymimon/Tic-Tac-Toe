import {useLoginUser} from "../service/socket";

import './invitation.scss';
import {PlayerName} from "./Player";

export function Invitation({players, onCancel, onApprove}) {
    const [by, against] = players;
    const loginUser = useLoginUser();

    const invited = (
        <>
            dual against <PlayerName user={by} className="user-inviting"/>
            <button class="primary" onClick={onApprove}>approve</button>
            <button class="secondary" onClick={onCancel}>decline</button>
        </>
    )

    const inviting = (
        <>
            waiting to <PlayerName user={against} className="user-invited"/>
            <button  class="secondary" onClick={onCancel}>cancel</button>
        </>
    )

    return (
        <tk-invitation >
            {loginUser.id === against.id && invited}
            {loginUser.id === by.id && inviting}
        </tk-invitation>
    )
}
