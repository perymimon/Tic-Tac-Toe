import './player.scss'
import Avatar from "boring-avatars";
import useCssClass from "@perymimon/react-hooks/useCssClass";

// const {
//     name, score, color, disconnect,   colorView,  AI, counterDown,
// } = props;

export function Player(props) {
    const {user, className="", style, ...basicProps} = props;

    const classesName = useCssClass({
        disconnected: !!user.disconnect,
        "mix-color":true,
        [className]: true,
    });
    const properties = {
        '--player-color': user.color,
        '--player-color-text'  : user.color,

        ...style,
    }

    const Icon = user.AI ? (<i className="fa-solid fa-robot"></i>) : (<Avatar
        square={false}
        name={user.name}
        variant="beam"
        colors={[user.color, "#F0AB3D", "#C271B4", "#C20D90"]}
    />);
    return (
        <tk-user {...basicProps} class={classesName} style={properties}>
            {Icon}
            <dd name="name">{user.name}</dd>
            <dd name="nickname">"the beast"</dd>
            <dt name="score" >score</dt>
            <dd name="score">{user.score}</dd>
            <dt />
            <dd />
            <dt name="icon"/>
            <dd name="icon">{(!!user.AI) ? '\uf4fb' : '\uf007'}</dd>
        </tk-user>
    )
}
export function PlayerCover(props) {
    return (
        <tk-cover-user>
            {Player(props)}
        </tk-cover-user>
    )
}


export function PlayerNameScore({className="", ...basicProps}) {
    const classesString = useCssClass({
        'small-banner': true,
        'name-score': true,
        [className]: true,
    });
    return <Player {...basicProps} showScore showName  className={classesString}/>
}

export function PlayerName({className="", ...basicProps}) {
    const classesString = useCssClass({
        'small-banner': true,
        [className]: true,
    });
    return <Player {...basicProps} showName className={classesString} />
}

// export function PlayerName(props) {
//
//     const {user, className="", ...basicProps} = props;
//     const classesString = useCssClass({
//         disconnected: !!user.disconnect,
//         'small-banner': true,
//         [className]: true,
//     }, className);
//
//
//     const Icon = user.AI ? <span className="icon">\f544</span> : (<Avatar
//         square={true}
//         name={user.name}
//         variant="beam"
//         colors={[user.color, "#F0AB3D", "#C271B4", "#C20D90"]}
//     />);
//
//     return (
//         <tk-user  {...basicProps} class={classesString}>
//             {Icon}
//             <dd name="name">{user.name}</dd>
//             <dd name="nickname">"the beast"</dd>
//         </tk-user>
//     )
// }

