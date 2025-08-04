import React from 'react'
import IconMaximize from '../icons/IconMaximize';
import IconMinimize from '../icons/IconMinimize';


type ChartLayoutProps = {
    label?: string;
    children: React.ReactNode;
}

const ChartLayout: React.FC<ChartLayoutProps> = ({ label, children }) => {
    const [isMaximized, setIsMaximized] = React.useState(false);

    const handleMaximize = () => {
        if(!isMaximized){
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        setIsMaximized(!isMaximized);
    }

    return (
        <>
            <div className='rounded-2xl p-6'>
                <div className='flex justify-between items-center mb-4'>
                    {label && <h2 className="text-lg font-semibold">{label}</h2>}
                    <span onClick={handleMaximize} className='ml-2 cursor-pointer'><IconMaximize /></span>
                </div>
                {children}
            </div>
            {isMaximized && (
                <div className='fixed hide-scroll top-0 left-0 w-full h-full bg-[var(--clr-primary)] z-50 flex items-center justify-center p-5 transition-all duration-300 ease-in-out'>
                    <div className='w-full max-w-[100%] md:max-w-[90%] lg:max-w-[80%] h-full flex items-center justify-center flex-col'>
                        <div className='flex justify-between items-center mb-4 w-full'>
                            <h2 className="text-lg font-semibold">{label}</h2>
                            <span onClick={handleMaximize} className='ml-2 cursor-pointer'><IconMinimize /></span>
                        </div>
                        {children}
                    </div>
                </div>
            )}
        </>
    )
}

export default ChartLayout