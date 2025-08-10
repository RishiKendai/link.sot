import clsx from 'clsx';
import React, { useRef, useEffect, useState, useCallback } from 'react'

interface TooltipProps {
    text: string;
    dir?: 'bottom' | 'top' | 'left' | 'right';
    children?: React.ReactNode;
}

const Tooltip = ({ text, dir = 'bottom', children }: TooltipProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateTooltipPosition = useCallback(() => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (dir) {
            case 'bottom':
                top = triggerRect.bottom + 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = triggerRect.top - tooltipRect.height - 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.right + 8;
                break;
        }

        setTooltipPosition({ top, left });
    }, [dir]);

    useEffect(() => {
        if (showTooltip) {
            updateTooltipPosition();
            window.addEventListener('scroll', updateTooltipPosition);
            window.addEventListener('resize', updateTooltipPosition);

            return () => {
                window.removeEventListener('scroll', updateTooltipPosition);
                window.removeEventListener('resize', updateTooltipPosition);
            };
        }
    }, [showTooltip, dir, updateTooltipPosition]);

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative"
            >
                {children}
            </div>
            <div
                ref={tooltipRef}
                className={clsx("fixed whitespace-nowrap bg-[var(--clr-tertiary)] text-white text-xs rounded py-1 px-2 pointer-events-none z-[9999]", showTooltip ? 'block' : 'hidden')}
                style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`,
                }}
            >
                {text}
            </div>
        </>
    );
};

export default Tooltip