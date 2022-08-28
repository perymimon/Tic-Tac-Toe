import './header.scss'
import { PlayerName } from "components/molecule/player/Player";
import { useConnected, useLoginUser } from "service/socket";
import { isDev } from "helpers/env";
// import packageJson from '/package.json';
import { version as reactVersion } from "react"

export function Header() {
    const user = useLoginUser();
    const isConnected = useConnected();

    const env = isDev ? '(dev)' : '';

    return (
        <header className="introduce-finish">
            {user.id ? <PlayerName player={user} showScore /> : <span />}
            Tic Tac Toe {env}
            <span className="disconnect-icon" title="socket disconnected">
                {!isConnected && <i className="fa-solid fa-wifi"></i>}
            </span>
            <ul className="versions">
             <li> app: {process.env.REACT_APP_VERSION}</li>
             <li> react: {reactVersion} </li>
            </ul>
            
        </header>
    )
}