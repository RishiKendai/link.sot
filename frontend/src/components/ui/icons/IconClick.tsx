import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconClick: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 12l3 0" />
        <path d="M12 3l0 3" />
        <path d="M7.8 7.8l-2.2 -2.2" />
        <path d="M16.2 7.8l2.2 -2.2" />
        <path d="M7.8 16.2l-2.2 2.2" />
        <path d="M12 12l9 3l-4 2l-2 4l-3 -9" />
    </IconBase>
)


export default IconClick;