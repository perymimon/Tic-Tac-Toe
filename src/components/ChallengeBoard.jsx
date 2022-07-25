import './challengeBoard.scss';
import {useLoginUser, useSocket} from "../service/socket";
import List from "./generic/list";
import {PlayerNameScore} from "./Player";


export function ChallengeBoard(props) {
    const {players, onChallenge} = props;
    const [users] = useSocket('users-list', [])
    const user = useLoginUser();

    const Player = function PlayerItem({item: player}) {

        return (
            <PlayerNameScore user={player} onClick={onChallenge} />
        )
    }

    return (
        <tk-challenge-board>
            <h5>challenge board</h5>
            <List data={users} keyName="id" component={Player}/>
        </tk-challenge-board>
    )

}