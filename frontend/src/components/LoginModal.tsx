import { useCallback, useEffect, useMemo, useState } from 'react';
import IconEye from './ui/icons/IconEye';
import IconEyeOff from './ui/icons/IconEyeOff';
import TextBox from './ui/inputs/TextBox';
import { validateField } from '../utils/validation';
import { useApiMutation } from '../hooks/useApiMutation';
import Alert, { type AlertProps } from './ui/Alert';
import Loader from './ui/Loader';
import { useAuth } from '../context/UseAuth';

import { useNavigate } from 'react-router-dom';

type modalState = 'login' | 'register' | null

interface LoginProps {
    handleModal: (state: modalState) => void
}

interface LoginResponse {
    name: string;
    email: string;
}

function Login({ handleModal }: LoginProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [formError, setFormError] = useState<Record<string, string>>({});
    const [alert, setAlert] = useState<AlertProps | null>(null)


    const navigate = useNavigate()
    const { setUser } = useAuth();


    const loginMutation = useApiMutation<{ email: string; password: string; }, LoginResponse>(['login'])
    const { isPending } = loginMutation
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const toggleVisibility = useCallback(() => {
        setIsPasswordVisible(prev => !prev);
    }, []);

    const PostfixIconMemo = useMemo(() => (
        <span className='cursor-pointer self-center opacity-85 hover:opacity-100'>
            <IconEye size={20} className={isPasswordVisible ? 'block' : 'hidden'} onClick={toggleVisibility} />
            <IconEyeOff size={20} className={isPasswordVisible ? 'hidden' : 'block'} onClick={toggleVisibility} />
        </span>
    ), [isPasswordVisible, toggleVisibility])

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const isEmailValid = validateField({ name: 'email', value: email, type: 'email', setError: setFormError })
        const isPasswordValid = validateField({ name: 'password', value: password, type: 'password', setError: setFormError })
        if (!isEmailValid || !isPasswordValid) return;
        loginMutation.mutate({
            path: '/login',
            method: 'POST',
            payload: { email, password }
        }, {
            onSuccess: (data) => {
                console.log('data :::: ', data)
                if (data && data.status === 'success' && data.data) {
                    setUser({ name: data.data.name, email: data.data.email })
                    return navigate('/links')
                }
                console.log('check ', data)
                if (data && data.status === 'error') {
                    console.log('data.error :::: ', data.error)
                    setAlert({ type: 'danger', message: data.error as string })
                    return;
                }
                if (data && data.status === 'unknown_error') {
                    console.log('data.error :::: ', data.error)
                    setAlert(null)
                    return;
                }
            },
            onError: () => {
                console.log('in error')
                console.log('error :::: ', loginMutation)
            }
        })
    }

    return (
        <section className='fixed inset-0 z-50 bg-black/30 block p-10 min-h-full overflow-y-auto'>
            <div className='flex items-center justify-center min-h-full'>
                <div className='bg-white p-10 h-fit rounded-3xl max-w-[414px] box-border w-full relative'>
                    <button onClick={() => handleModal(null)} className='absolute right-4 top-3 p-1 rounded-lg text-black/60 hover:text-black duration-300 cursor-pointer'>
                        <svg height={20} width={20} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className='text-3xl font-bold txt-gradient mb-6 text-center'>Welcome back!</div>
                    <div className="relative flex items-center justify-center py-4">
                        <div className="w-full border-t border-gray-300"></div>
                        <span className="px-3 bg-white text-gray-500 text-sm">OR</span>
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <form onSubmit={handleLogin} noValidate >
                        {/* Email */}
                        <TextBox
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.currentTarget.value)}
                            label="Email"
                            type="email"
                            wrapperClass='mb-4'
                            placeholder="your.email@example.com"
                            error={formError.email}
                        />
                        {/* Password */}
                        <TextBox
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.currentTarget.value)}
                            label="Password"
                            type={isPasswordVisible ? 'text' : 'password'}
                            wrapperClass='mb-6'
                            placeholder="••••••••"
                            error={formError.password}
                            postfixIcon={PostfixIconMemo}
                        />
                        {alert && <Alert type={alert.type} message={alert.message} className='mb-6' />}
                        <button disabled={isPending} type="submit" className="w-full h-10 rounded text-lg leading-tight btn btn-animate bg-black  cursor-pointer">
                            {
                                isPending
                                    ? <Loader className=' h-6 black w-6' />
                                    : <span className="text-white font-bold text-md">Login</span>
                            }
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don't have an account? <a href="#" className="text-purple-600 hover:text-purple-800 font-medium" onClick={() => handleModal('register')}>Register</a>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login