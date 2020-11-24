import Timer from '@perymimon/timer'
import {useEffect, useState} from "react";

export default function useTimer(time, tickTime, cb, restartsConditions){
    const [timer] = useState(_ => new Timer(time, null, true))
    useEffect(()=>{
        timer.clearTicks();
        timer.tick(tickTime, _=> cb(timer));
        return _=> timer.clearTicks();
        // eslint-disable-next-line
    } , [time,cb,tickTime]);

    useEffect(function () {
        timer.restart();
        return () => {
            timer.stop()
        }
        // eslint-disable-next-line
    }, [...restartsConditions])

    return timer;
}