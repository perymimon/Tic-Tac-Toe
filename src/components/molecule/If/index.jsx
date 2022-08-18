import { useRun, useTimeout } from '@perymimon/react-hooks';
import { useState } from 'react';

export function If({ show, children, showdelay = 0, hidedelay = 0, name, ...otherProp }) {
    const [internalShow, setShow] = useState(show);

    const { reset } = useTimeout(
        () => setShow(show),
        show ? showdelay : hidedelay
    );

    useRun(() => reset(), [show])

    if (!internalShow) return null;
    return children;
}