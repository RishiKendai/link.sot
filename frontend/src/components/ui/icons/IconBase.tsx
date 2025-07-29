import React from 'react';

export interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number;
    color?: string;
}

export const IconBase: React.FC<IconBaseProps & { children: React.ReactNode }> = ({
    size = 24,
    strokeWidth = 2,
    color = 'currentColor',
    children,
    ...props
}) => {
    return (
        <svg
            width={size}
            height={size}
            className={`shrink-0`}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {children}
        </svg>
    )
};
