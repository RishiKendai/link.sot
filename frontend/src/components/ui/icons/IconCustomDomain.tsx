import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconCustomDomain: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linejoin="round" />
    </IconBase>
)


export default IconCustomDomain;