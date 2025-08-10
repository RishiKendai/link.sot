import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconAPIIntegration: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="white" strokeWidth="2" />
        <line x1="8" y1="21" x2="16" y2="21" stroke="white" strokeWidth="2" />
        <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" />
        <path d="M7 8L10 11L7 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="13" y1="12" x2="17" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
)


export default IconAPIIntegration;