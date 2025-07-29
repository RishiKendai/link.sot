import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconHamburger: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10 6h10" />
        <path d="M4 12h16" />
        <path d="M7 12h13" />
        <path d="M4 18h10" />
    </IconBase>
)


export default IconHamburger;