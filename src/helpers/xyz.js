import {APPEAR, DISAPPEAR, SWAP} from "@perymimon/react-anime-manager";

export function phase2xyz (phase,appearClass ='xyz-appear', swapClass= 'xyz-in', disappearClass='xyz-out') {
    if(phase === APPEAR) return appearClass;
    if(phase === DISAPPEAR) return swapClass
    if(phase === SWAP) return disappearClass
    return ''
}