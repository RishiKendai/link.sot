import React from 'react';
import { IconBase, type IconBaseProps } from './IconBase';

const IconQrCode: React.FC<IconBaseProps> = ({ size = 24, color = 'currentColor', className }) => {
    return (
        <IconBase size={size} color={color} className={className}>
            <path d="M3 3h6v6H3z" />
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
            <path d="M3 9h6" />
        </IconBase>
    );
};

export default IconQrCode; 