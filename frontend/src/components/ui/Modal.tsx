// components/ui/modal/Modal.tsx
import React, { useEffect } from 'react';
import IconX from './icons/IconX';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {

    useEffect(() => {
        if (isOpen)
            document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen])

    if (!isOpen) return null;
    return (
        <div data-modal className='fixed inset-0 flex items-center justify-center bg-black/10 z-50'>
            <div className="bg-white rounded-3xl shadow-lg p-7 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600 text-xl font-bold">
                    <IconX size={20} />
                </button>
                {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default Modal;
