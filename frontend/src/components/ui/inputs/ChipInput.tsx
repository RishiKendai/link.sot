import React, { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import IconX from '../icons/IconX';

import './chipinput.css';

interface ChipInputProps {
    label?: string;
    placeholder?: string;
    initialValues?: string[];
    classNames?: string;
    name?: string;
    srOnly?: boolean;
    disabled?: boolean;
    maxChips?: number;
    onValuesChange?: (values: string[]) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    required?: boolean;
    error?: string;
    allowComma?: boolean;
    allowSpace?: boolean;
}

const getDelimiters = (allowComma: boolean, allowSpace: boolean): RegExp | null => {
    if (allowComma && allowSpace) return /[,\s]+/;
    if (allowComma) return /,+/;
    if (allowSpace) return /\s+/;
    return null;
};

const ChipInput: React.FC<ChipInputProps> = ({
    label,
    placeholder = 'Type and press Enter...',
    initialValues = [],
    classNames = '',
    name,
    srOnly = false,
    disabled = false,
    maxChips,
    onValuesChange,
    onBlur,
    onFocus,
    required = false,
    error,
    allowComma = false,
    allowSpace = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [chips, setChips] = useState<string[]>(initialValues.map(v => v.trim()).filter(Boolean));
    const [inputValue, setInputValue] = useState('');
    // const [isInitialized, setIsInitialized] = useState(false);
    // const [hasInitialized, setHasInitialized] = useState(false);

    // Only update chips from initialValues on the very first render
    useEffect(() => {
        console.log('initialValues', initialValues)
        // if (!hasInitialized) {
        const chipsList = initialValues.map(v => v.trim()).filter(Boolean);
        setChips(chipsList);
        // setHasInitialized(true);
        // }
    }, [initialValues]);

    // if (initialValues.length > 0) {
    //     setChips(initialValues.map(v => v.trim()).filter(Boolean));
    // }
    // Mark as initialized after first render
    // useEffect(() => {
    //     if (!isInitialized) {
    //         setIsInitialized(true);
    //     }
    // }, [isInitialized]);

    // useEffect(() => {
    //     if (isInitialized) {
    //         onValuesChange?.(chips);
    //     }
    // }, [chips, onValuesChange, isInitialized]);

    const addChip = (value: string) => {
        console.log('addChip', value)
        const trimmed = value.trim();
        if (!trimmed || chips.includes(trimmed)) return;
        if (maxChips && chips.length >= maxChips) return;

        setChips(prev => {
            const updated = [...prev, trimmed]
            onValuesChange?.(updated)
            return updated
        });
        setInputValue('');
    };

    // const addChip = useCallback((value: string) => {
    //     const trimmed = value.trim();
    //     if (!trimmed || chips.includes(trimmed)) return;
    //     if (maxChips && chips.length >= maxChips) return;

    //     setChips(prev => [...prev, trimmed]);
    //     setInputValue('');
    // }, [chips, maxChips]);

    const removeChip = (value: string) => {
        setChips(prev => {
            const updated = prev.filter(chip => chip !== value)
            onValuesChange?.(updated)
            return updated
        });
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const key = e.key;

        if (key === 'Enter') {
            e.preventDefault();
            addChip(inputValue);
        }

        if (key === ',' && !allowComma) {
            e.preventDefault();
            addChip(inputValue);
        }

        if (key === ' ' && !allowSpace) {
            e.preventDefault();
            addChip(inputValue);
        }

        if (key === 'Backspace' && inputValue === '' && chips.length > 0) {
            removeChip(chips[chips.length - 1]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        const delimiterRegex = getDelimiters(allowComma, allowSpace);

        if (delimiterRegex && delimiterRegex.test(value)) {
            const parts = value.split(delimiterRegex).filter(Boolean);
            parts.slice(0, -1).forEach(part => addChip(part));
            setInputValue(parts[parts.length - 1] || '');
        }
    };

    return (
        <div className={`flex flex-col ${classNames}`}>
            {label && (
                <label className={`w-fit text-sm font-medium text-gray-700 mb-2 ${srOnly ? 'sr-only' : ''}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                className={`chip-input-wrapper  ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} focus-within:ring-1 focus-within:ring-[var(--clr-primary-invert)]`}
                onClick={() => inputRef.current?.focus()}
            >
                <div className="chips-container">
                    {chips.map((chip) => (
                        <div key={chip} className="chip">
                            <span className="chip-value">{chip}</span>
                            <button
                                type="button"
                                className="chip-remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeChip(chip);
                                }}
                                disabled={disabled}
                            >
                                <IconX color='red' />
                            </button>
                        </div>
                    ))}

                    <input
                        ref={inputRef}
                        name={name}
                        type="text"
                        className="chip-input-field"
                        placeholder={chips.length === 0 ? placeholder : ''}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            onFocus?.();
                        }}
                        onBlur={() => {
                            onBlur?.();
                        }}
                        disabled={disabled}
                    />
                </div>
            </div>

            {error && <div className="chip-input-error">{error}</div>}
            {maxChips && (
                <div className="chip-input-counter">
                    {chips.length}/{maxChips}
                </div>
            )}
        </div>
    );
};

export default ChipInput;
