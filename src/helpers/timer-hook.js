import Timer from '@perymimon/timer'
import {useEffect, useState} from "react";

export default function useTimer(time, tickTime, cb, restartsConditions){
    const [timer] = useState(_ => new Timer(time, null, true))
    useEffect(()=>{
        timer.clearTicks();
        timer.tick(tickTime, _=> cb(timer));
    } , [time]);

    useEffect(function () {
        timer.restart();
        return () => {
            timer.stop()
        }
    }, [...restartsConditions])

    return timer;
}