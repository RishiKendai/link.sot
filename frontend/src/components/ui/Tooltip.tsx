import React from 'react'


const tooltipClasses = {
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
}

const Tooltip = ({ text, dir = 'bottom' }: { text: string, dir?: 'bottom' | 'top' | 'left' | 'right' }) => {
    return (
        <div className={`absolute ${tooltipClasses[dir]} whitespace-nowrap bg-[var(--clr-tertiary)] text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
            {text}
        </div>
    )
}

export default Tooltip