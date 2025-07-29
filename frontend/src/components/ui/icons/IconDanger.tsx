import React from 'react';
import { IconBase, type IconBaseProps } from './IconBase';

const IconDanger: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M10 10l4 4m0 -4l-4 4" />
    </IconBase>
);
export default IconDanger