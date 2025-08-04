import React from 'react';
import { IconBase, type IconBaseProps } from './IconBase';

const IconQrCode: React.FC<IconBaseProps> = ({ size = 24, color = 'currentColor', className }) => {
    return (
        <IconBase size={size} color={color} className={className}>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
            <path d="M7 17l0 .01" />
            <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
            <path d="M7 7l0 .01" />
            <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
            <path d="M17 7l0 .01" />
            <path d="M14 14l3 0" />
            <path d="M20 14l0 .01" />
            <path d="M14 14l0 3" />
            <path d="M14 20l3 0" />
            <path d="M17 17l3 0" />
            <path d="M20 17l0 3" />
            {/* <path d="M3 3h6v6H3z" />
            <path d="M15 3h6v6h-6z" />
            <path d="M3 15h6v6H3z" />
            <path d="M15 15h6v6h-6z" />
            <path d="M6 6h2v2H6z" />
            <path d="M16 6h2v2h-2z" />
            <path d="M6 16h2v2H6z" />
            <path d="M16 16h2v2h-2z" />
            <path d="M9 3v6" />
            <path d="M21 9h-6" />
            <path d="M9 21v-6" />
            <path d="M3 9h6" /> */}
        </IconBase>
    );
};

export default IconQrCode; 