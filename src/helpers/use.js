import {useLayoutEffect} from "react";

export function useApplyCssInit(ref, className = "init") {
    useLayoutEffect(_ => {
        ref.current?.classList.add(className);
        requestAnimationFrame(_ => {
            ref.current?.classList.remove(className);
        })
    }, [])
}