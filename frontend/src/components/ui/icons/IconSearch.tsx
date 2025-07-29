import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconSearch: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconBase>
)


export default IconSearch;