import './list.scss'
import {useAnimeManager} from '@perymimon/react-anime-manager'

export default function List(props) {
    const {data, keyName, component, sortedKeys, style, ...otherProps} = props;
    const [dataState, transitions] = useAnimeManager(data, keyName);

    const items = transitions(({item, phase, done}, {dy, isMove}) => {
        const properties = {
            ...style,
            '--list-dy': `${dy}px`,
        }
        return <li phase={phase} style={properties}
                   data-after-layout={isMove}
                   onAnimationEnd={done}>

            {component({...otherProps, item})}

        </li>
    })

    return (
        <ul>
            {items}
        </ul>
    )
}

// export default function List(props) {
//     const {children, data, component, sortedKeys, ...otherProps} = props;
//     console.log('list render');
//     const [dataState, traverse] = useAnimeManager(data, {key: 'id', debug: false, onMotion});
//
//     function onMotion({item, dom, ref, ...state}) {
//         const {dx, dy, meta_dx, meta_dy, abs_dx, abs_dy, ...rest} = state;
//         // console.log(dx, dy, meta_dx, meta_dy, abs_dx, abs_dy);
//         dom.style.setProperty('--dy', `${-meta_dy}px`);
//     }
//
//     return (
//         <>
//             <menu>
//
//             </menu>
//             <ul className="list">
//                 {traverse(({item: datum, phase, done, ref, meta_dy, afterDelta}, index) => {
//                     return <li key={datum.id || index}
//                                phase={phase} afterdelta={afterDelta}
//                                ref={ref}
//                                onAnimationEnd={done}
//                                className="list-member">
//                         {component({...otherProps, ...datum})}
//                     </li>
//                 })}
//             </ul>
//         </>
//     )
// }