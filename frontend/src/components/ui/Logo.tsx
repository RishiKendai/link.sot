import clsx from 'clsx'

interface LogoProps {
    logoSize?: number
    titleSize?: string
    className?: string
}

function Logo({ logoSize = 35, titleSize, className }: LogoProps) {
    return (
        <div className={clsx('logo-wrapper flex items-center', className)}>
            <div className='mr-2'>
                <img src="/logo.svg" alt="logo" className="logo" width={logoSize} height={logoSize} />
            </div>
            <span className={clsx(titleSize || 'text-2xl md:text-3xl', 'font-bold txt-gradient')}>LinkSot</span>
        </div>
    )
}

export default Logo