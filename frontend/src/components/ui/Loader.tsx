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
            className={clsx('loader border-t-3', className, !className && 'w-7 h-7')}
            style={{ ['--loader-color' as string]: color }}
        ></span>
    );
}

export default Loader
