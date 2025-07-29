import React from 'react'
import IconTick from '../icons/IconTick';
import clsx from 'clsx';

interface CheckboxProps {
    label: string;
    id: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, checked, onChange }) => {
    return (
        <div className='flex items-start gap-2'>
            <input type="checkbox" id={id} checked={checked} onChange={onChange} className='hidden' />
            <div
                onClick={() => onChange({ target: { checked: !checked } } as React.ChangeEvent<HTMLInputElement>)}
                className={clsx('w-5 h-5 min-w-5 min-h-5 max-w-5 max-h-5 border border-gray-400 rounded-sm flex items-center justify-center',
                    { 'gct border-white': checked, 'bg-white border-gray-300': !checked })}>
                {checked && <IconTick className='w-4 h-4' color='white' strokeWidth={3} />}
            </div>
            <label htmlFor={id} className='text-sm font-medium text-gray-700'>{label}</label>
        </div>
    )
}

export default Checkbox