import React, { type JSX } from 'react';
import IconInfo from './icons/IconInfo';
import IconWarning from './icons/IconWarning';
import IconDanger from './icons/IconDanger';
import IconSuccess from './icons/IconSuccess';


export type AlertProps = {
    type: 'info' | 'danger' | 'success' | 'warning';
    message: string;
    className?: string
}

const icon: Record<AlertProps['type'], JSX.Element> = {
    info: <IconInfo />,
    danger: <IconDanger />,
    warning: <IconWarning />,
    success: <IconSuccess />,
}

const cls = {
    info: 'text-blue-800 bg-blue-50 border border-blue-300',
    danger: 'text-red-800 bg-red-50 border border-red-300',
    warning: 'text-yellow-800 bg-yellow-50 border border-yellow-300',
    success: 'text-green-800 bg-green-50 border border-green-300',
}

const Alert: React.FC<AlertProps> = ({ type, message, className }) => {
    console.count('type')
    console.log("Alert-----------------------")
    return (
        <div className={`${cls[type]} ${className} flex items-start space-x-2 text-sm font-medium px-4 py-2 rounded-lg`} role="alert">
            <span>{icon[type]}</span>
            <span className='self-center'>{message}</span>
        </div>
    );
}

export default Alert