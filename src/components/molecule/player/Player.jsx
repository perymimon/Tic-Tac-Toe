import './player.scss'
import Avatar from "boring-avatars";
import useCssClass from "@perymimon/react-hooks/css/useCssClass";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useInterval, useLazyPrevious, useRun } from '@perymimon/react-hooks';

// const {
//     name, score, color, disconnect,   colorView,  AI, counterDown,
// } = props;
export const Player = forwardRef(
    function Player(props, ref) {
        const $playerRef = useRef(null)
        useImperativeHandle(ref, () => $playerRef.current);

        const { player, className = "", style, onClick, ...basicProps } = props;

        const classesName = useCssClass({
            disconnected: !!player.disconnect,
            "mix-color": false,
            [className]: true,
            [player.class]: true,
        });

        const properties = {
            '--player-color': player.color,
            '--player-color-2': player.color2,
            '--player-color-3': player.color3,
            '--player-color-text': player.color2,
            ...style,
        }

        const handleClick = useCallback(() => {
            onClick?.(player)
        }, [player, onClick])

        const icon = player.AI ? (<i className="fa-solid fa-robot"></i>) : (<Avatar
            square={false}
            name={player.name}
            variant="beam"
            colors={[player.color, player.color2, player.color3, "#F0AB3D", "#C271B4", "#C20D90"]}
        />);

        const [oldScore, ver] = useLazyPrevious(player.score);
        const { restart, clear } = useInterval(() => {
            var $score = $playerRef.current.querySelector('dd[name="score"]');
            var currentScore = Number($score.innerText);
            if (currentScore === player.score) { clear(); return; }
            var sign = Math.sign(player.score - currentScore);
            $score.innerText = currentScore + sign;
        }, 10, { autoStart: false });

        useRun(() => restart(), [player.score]);

        return (
            <tk-player ref={$playerRef} {...basicProps} class={classesName} style={properties} onClick={handleClick}>
                {icon}
                <dd name="name">{player.name}</dd>
                <dd name="nickname">"{player.slogan}"</dd>
                <dt name="score">score</dt>
                <dd name="score">{oldScore}</dd>
                <dt />
                <dd />
                <dt name="icon" />
                <dd name="icon">{(!!player.AI) ? '\uf4fb' : '\uf007'}</dd>
            </tk-player>
        )
    }
)

export function PlayerCover({ coverStyle, coverClass, ...otherProps }) {
    return (
        <tk-cover-player style={coverStyle} class={coverClass}>
            <Player {...otherProps} />
        </tk-cover-player>
    )
}

export function PlayerNameScore({ className = "", ...basicProps }) {
    const classesString = useCssClass({
        'small-banner': true,
        'name-score': true,
        [className]: true,
    });
    return <Player {...basicProps} showScore showName className={classesString} />
}

export function PlayerName({ className = "", ...basicProps }) {
    const classesString = useCssClass({
        'small-banner': true,
        [className]: true,
    });
    return <Player {...basicProps} showName className={classesString} />
}

export function PlayerHead({ className = "", ...basicProps }) {
    return <Player {...basicProps}
        showTag={false}
        showName={false} className={useCssClass(className, {
            'just-head': true,
        })} />
}

