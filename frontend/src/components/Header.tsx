import Logo from './ui/Logo'

type modalState = 'login' | 'register' | null

interface HeaderProps {
    handleModal: (state: modalState) => void
}

function Header({ handleModal }: HeaderProps) {
    return (
        <header className='z-9 flex backdrop border border-white/30 fixed top-0 left-0 w-full p-3.5 shadow-lg'>
            <Logo />
            <div className='ml-auto flex'>
                <button onClick={() => handleModal('login')} className='mr-3 btn cursor-pointer hidden sm:block'><span className="text-[var(--clr-secondary)] hover:text-[var(--clr-secondary)]/70 font-semibold text-md">Login</span></button>
                <button onClick={() => handleModal('register')} className='btn btn-animate gpb cursor-pointer'><span className="text-white font-bold text-md">Sign Up Free</span></button>
            </div>

        </header>
    )
}

export default Header