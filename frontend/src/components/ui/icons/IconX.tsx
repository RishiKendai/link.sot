import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconX: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
    </IconBase>
)


export default IconX;