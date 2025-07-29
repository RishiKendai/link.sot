import React from 'react';
import { IconBase } from './IconBase';
import type { IconBaseProps } from './IconBase';

const IconLink: React.FC<IconBaseProps> = (props) => (
    <IconBase {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9.183 6.117a6 6 0 1 0 4.511 3.986" />
        <path d="M14.813 17.883a6 6 0 1 0 -4.496 -3.954" />
    </IconBase>
);

export default IconLink;