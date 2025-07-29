import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconClock: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
        <path d="M12 7v5l3 3" />
    </IconBase>
)


export default IconClock;