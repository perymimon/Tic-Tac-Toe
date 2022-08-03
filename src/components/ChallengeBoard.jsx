import './challengeBoard.scss';
import {useLoginUser, useSocket} from "../service/socket";
import List from "./generic/list";
import {PlayerNameScore} from "./Player";
import {useMemo} from "react";


export function ChallengeBoard(props) {
    const {onChallenge} = props;
    const [users] = useSocket('users-list', [])
    const user = useLoginUser();

    const usersWithoutMe = useMemo(_ => users.filter(u => u.id !== user.id), [users, user])
    /* make the challenge thake more span if needed. hope one day it can done just by css*/
    const properties = {
        'gridRowEnd': `span ${Math.ceil(users.length / 4)} `
    }
    return (
        <tk-challenge-board style={properties}>
            <h5>challenge board</h5>
            <List data={usersWithoutMe} keyName="id" component={PlayerItem}/>
        </tk-challenge-board>
    )

    function PlayerItem({item: player}) {
        return (
            <PlayerNameScore user={player} onClick={onChallenge}/>
        )
    }
}