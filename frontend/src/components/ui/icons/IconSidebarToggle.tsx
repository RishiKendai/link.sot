import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconSidebarToggle: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
        <path d="M9 4l0 16" />
    </IconBase>
);

export default IconSidebarToggle; 