import Loader from './ui/Loader'

const PageLoader = () => {
    return (
        <div className='h-screen w-full flex items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
                <div className='relative w-14 h-14'>
                    <div className='absolute top-1/2 left-1/2 -translate-1/2' style={{ animation: 'spin-reverse 1s linear infinite' }}>
                        <img height={34} width={34} src='/logo.svg' alt='logo' />
                    </div>
                    <Loader color='#6366f1' className='w-14 h-14' />
                </div>
                <span className="ml-2 text-3xl font-extrabold txt-gradient gpb">LinkSot</span>
            </div>
        </div>)
}

export default PageLoader