import React from 'react';
import QRCode from "react-qr-code";

interface QRCodeGeneratorProps {
    url: string;
    size?: number;
    className?: string;
    id?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
    url,
    size = 32,
    className = '',
    id=''
}) => {
    return (
        <div className={`${className}`}>
            <QRCode
                value={url}
                size={size}
                id={id}
                bgColor='transparent'
                style={{ height: 'auto', maxHeight: size, maxWidth: '100%', width: '100%' }}
                viewBox='0 0 256 256'
            />
        </div>
    );
};

export default QRCodeGenerator; 