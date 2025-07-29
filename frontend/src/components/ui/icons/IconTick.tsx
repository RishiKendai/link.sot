import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconTick: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path d="M20 6 9 17l-5-5" />
    </IconBase>
)


export default IconTick;