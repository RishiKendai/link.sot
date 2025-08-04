import React, { useEffect, useState } from 'react'
import QRCodeGenerator from './QRCodeGenerator';
import IconX from './ui/icons/IconX';
import IconCopy from './ui/icons/IconCopy';
import IconTick from './ui/icons/IconTick';
import Button from './ui/button/Button';
import IconDownload from './ui/icons/IconDownload';

type ModalProps = {
    url: string;
    handleModalState: (state: boolean) => void
}

const baseURL = import.meta.env.VITE_SOT_HOST

const ModalShare: React.FC<ModalProps> = ({ url, handleModalState }) => {
    const [isLinkCopied, setIsLinkCopied] = useState(false)
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [])

    const downloadQR = (type: 'PNG' | 'JPG') => {
        const canvasSize = 2000;      // total canvas size
        const padding = 200;          // space on all sides
        const qrSize = canvasSize - padding * 2; // size of the QR image

        const svg = document.getElementById("QRCode") as HTMLElement;
        const svgData = new XMLSerializer().serializeToString(svg);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = canvasSize;  
            canvas.height = canvasSize;
            if (ctx) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvasSize, canvasSize);
                ctx.drawImage(img, padding, padding, qrSize, qrSize);
            }

            const pngFile = canvas.toDataURL(`image/${type}`);
            const downloadLink = document.createElement("a");
            downloadLink.href = `${pngFile}`;
            downloadLink.download = `link.sot_${url}.${type.toLowerCase()}`;
            downloadLink.click();
            URL.revokeObjectURL(svgUrl);
        };
    }
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/10 z-50'>
            <div className="bg-white rounded-2xl p-6 w-full max-w-[414px]">
                <div className='relative pb-6 flex flex-col items-center'>
                    <h6 className='text-2xl mb-2 text-center font-bold'>Share Link</h6>
                    <p className='txt-2 text-sm text-center w-3/4'>Share your link.sot link with others to get started.</p>
                    <span className='absolute -top-4 -right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-full' onClick={() => handleModalState(false)}>
                        <IconX size={20} />
                    </span>
                </div>
                <div className='bg-gray-100 min-w-0 flex items-center overflow-hidden p-2 px-4 rounded-lg mb-6'>
                    <span className='text-sm text-nowrap truncate w-fit max-w-full'>{baseURL}/{url}</span>
                    <span className='ml-2 cursor-pointer  p-2' onClick={() => {
                        navigator.clipboard.writeText(baseURL + '/' + url)
                        setIsLinkCopied(true)
                        setTimeout(() => {
                            setIsLinkCopied(false)
                        }, 2000)
                    }}>
                        {isLinkCopied ? (
                            <IconTick size={18} />
                        ) : (
                            <IconCopy size={18} />
                        )}
                    </span>
                </div>
                <QRCodeGenerator
                    url={`${baseURL}/${url}?r=qr`}
                    size={78}
                    className="mb-6"
                />
                <QRCodeGenerator
                    url={`${baseURL}/${url}?r=qr`}
                    size={2000}
                    id='QRCode'
                    className="mb-6 hidden"
                />
                <div className='flex gap-4 justify-center'>
                    <Button label='Download PNG' prefixIcon={<IconDownload size={20} />} className='text-sm gsbb' onClick={() => downloadQR('PNG')} />
                    <Button label='Download JPG' prefixIcon={<IconDownload size={20} />} className='text-sm gsbb' onClick={() => downloadQR('JPG')} />
                </div>
            </div>

        </div>
    )
}

export default ModalShare