import React, { type ReactElement } from 'react';
import './TextBox.css';
import clsx from 'clsx';

interface TextBoxProps {
    id: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    required?: boolean;
    type?: React.HTMLInputTypeAttribute;
    name?: string;
    wrapperClass?: string;
    className?: string;
    placeholder?: string;
    error?: string;
    info?: string;
    prefixIcon?: ReactElement | React.ReactNode;
    postfixIcon?: ReactElement | React.ReactNode;
    disabled?: boolean;
    srOnly?: boolean;
    onClick?: () => void;
    readOnly?: boolean;
}

const TextBox: React.FC<TextBoxProps> = ({
    label,
    required,
    type = 'text',
    id,
    wrapperClass,
    className,
    name,
    value,
    placeholder,
    onChange,
    error,
    info,
    prefixIcon,
    postfixIcon,
    disabled = false,
    srOnly = false,
    onClick = () => { },
    readOnly = false,
}) => {
    return (
        <div onClick={onClick} className={`flex flex-col ${wrapperClass ? wrapperClass : ''} input-container ${error ? 'error' : ''}`}>
            {label && <label htmlFor={id} className={`w-fit text-sm font-medium text-gray-700 mb-2 ${srOnly ? 'sr-only' : ''}`}>
                {label}{' '}
                {required === true && <span className="text-red-500">*</span>}
                {required === false && (
                    <span className="text-gray-400 text-sm">(optional)</span>
                )}
            </label>}

            <div className={clsx(
                'input-box',
                {
                    'border-red-500 shadow-sm ring-1 ring-red-500': error,
                    'focus-within:border-[var(--clr-primary-invert)] ring-1 ring-transparent focus-within:ring-1 focus-within:ring-[var(--clr-primary-invert)]': !error
                }
            )}>
                {prefixIcon && prefixIcon}

                <input
                    type={type}
                    id={id}
                    name={name ? name : id}
                    value={value}
                    {...(onChange && { onChange })}
                    placeholder={placeholder || ''}
                    disabled={disabled}
                    autoComplete='on'
                    readOnly={readOnly}
                    
                    className={`textbox - input ${className || ''} text - [var(--text-primary)] outline-0 border-0 bg-transparent w-full ${disabled ? 'text-gray-400 cursor-not-allowed' : ''}`}
                />

                {postfixIcon && postfixIcon}
            </div>

            {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
            {info && !error && <div className="mt-1 text-xs text-gray-400">{info}</div>}
        </div >
    );
};

export default TextBox;
