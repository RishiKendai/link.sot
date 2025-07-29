import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconArrowBarToRight: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14 12l-10 0" />
        <path d="M14 12l-4 4" />
        <path d="M14 12l-4 -4" />
        <path d="M20 4l0 16" />
    </IconBase>
)


export default IconArrowBarToRight;