import React from 'react'
import { IconBase, type IconBaseProps } from './IconBase'

const IconShieldOff: React.FC<IconBaseProps> = (props) => {
    return (
        <IconBase {...props}>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M17.67 17.667a12 12 0 0 1 -5.67 3.333a12 12 0 0 1 -8.5 -15c.794 .036 1.583 -.006 2.357 -.124m3.128 -.926a11.997 11.997 0 0 0 3.015 -1.95a12 12 0 0 0 8.5 3a12 12 0 0 1 -1.116 9.376" />
            <path d="M3 3l18 18" />
        </IconBase>
    )
}

export default IconShieldOff