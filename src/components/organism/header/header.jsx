import './header.scss'
import {PlayerName} from "components/molecule/player/Player";
import {useConnected, useLoginUser} from "service/socket";
import {isDev} from "helpers/env";

export function Header() {
    const user = useLoginUser();
    const isConnected = useConnected();

    const env = isDev ? '(dev)' : '';

    return (
        <header className="introduce-finish">
            {user.id ? <PlayerName user={user} showScore/> : <span/>}
            Tic Tac Toe {env}
            <span className="disconnect-icon" title="socket disconnected">
                {!isConnected && <i className="fa-solid fa-wifi"></i>}
                </span>
        </header>
    )
}