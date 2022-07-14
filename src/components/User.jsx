import './user.scss'
import Avatar from "boring-avatars";


export function Player(props) {
    const {user, style} = props;
    // const {
    //     name, score, color, disconnect,   colorView,  AI, counterDown,
    // } = props;
    return (
        <tk-cover-user>
            <tk-cover-reveal>
                <tk-user style={style}>
                    <Avatar
                        className="avatar"
                        name={user.name}
                        variant="beam"
                        colors={[user.color, "#F0AB3D", "#C271B4", "#C20D90"]}
                    />
                    <div className="name">{user.name}</div>
                    <div className="nick-name">"the beast"</div>
                    <dl>
                        <dt>score</dt>
                        <dd>{user.score}</dd>
                        <dt>AI</dt>
                        <dd>{(!!user.AI) ? '\uf4fb' : '\uf007'}</dd>
                        <dd data-online={!user.disconnect}></dd>
                    </dl>
                </tk-user>
            </tk-cover-reveal>
        </tk-cover-user>
    )
}