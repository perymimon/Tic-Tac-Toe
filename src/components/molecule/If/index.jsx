import { useRun, useTimeout } from '@perymimon/react-hooks';
import { useState } from 'react';

export function If({ show, children, showdelay = 0, hidedelay = 0, name, ...otherProp }) {
    const [internalShow, setShow] = useState(show);

    const { restart } = useTimeout(
        () => setShow(show),
        show ? showdelay : hidedelay
    );

    useRun(() => restart(), [show])

    if (!internalShow) return null;
    return children;
}