import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconExpiry: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10.5 21h-4.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v3" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M4 11h10" />
        <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M18 16.5v1.5l.5 .5" />
    </IconBase>
)


export default IconExpiry;