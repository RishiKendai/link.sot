import clsx from 'clsx';
import React from 'react';

import './loader.css'

type LoaderProps = {
    className?: string
    color?: string
}
const Loader: React.FC<LoaderProps> = ({ className, color }) => {
    return (
        <span
            className={clsx('loader h-7 w-7 border-t-3', className)}
            style={{ ['--loader-color' as string]: color }}
        ></span>
    );
}

export default Loader
