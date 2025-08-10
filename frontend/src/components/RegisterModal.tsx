import { useEffect, useState } from 'react'
import TextBox from './ui/inputs/TextBox';
import Alert, { type AlertProps } from './ui/Alert';
import IconEye from './ui/icons/IconEye';
import IconEyeOff from './ui/icons/IconEyeOff';
import { validateField } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import { useApiMutation } from '../hooks/useApiMutation';
import { useAuth } from '../context/UseAuth';
import Button from './ui/button/Button';

type modalState = 'login' | 'register' | null

interface RegisterProps {
    handleModal: (state: modalState) => void
    heroLink?: string
}

type RegisterResponse = {
    name: string;
    email: string;
    redirect_to?: string;
}

type RegisterPayload = {
    name: string;
    password: string;
    email: string;
}

function Register({ handleModal, heroLink }: RegisterProps) {
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const { mutate: registerMutation, isPending } = useApiMutation<RegisterPayload, RegisterResponse>(['register'])

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

    const [formError, setFormError] = useState<Record<string, string>>({})
    const [alert, setAlert] = useState<AlertProps | null>(null)

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);



    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const isNameValid = validateField({ name: 'name', value: name, type: 'name', setError: setFormError })
        const isEmailValid = validateField({ name: 'email', value: email, type: 'email', setError: setFormError })
        const isPasswordValid = validateField({ name: 'password', value: password, type: 'password', setError: setFormError })
        const isConfirmPasswordValid = validateField({ name: 'confirmPassword', fieldName: 'Confirm password', value: confirmPassword, type: 'password', setError: setFormError })
        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) return;
        if (password !== confirmPassword) {
            setFormError((prev) => ({ ...prev, confirmPassword: 'password do not match' }))
            return;
        }
        setFormError({})
        let path = '/register'
        if (heroLink) {
            const encodedURL = encodeURIComponent(heroLink)
            path = `/register?action=shorten&redirect_to=link_details&hero_link=${encodedURL}`
        }
        registerMutation({
            path: path,
            method: 'POST',
            payload: { name, email, password }
        }, {
            onSuccess: (data) => {
                if (data && data.status === 'success' && data.data) {
                    setUser({ name: data.data.name, email: data.data.email })
                    if (data.data.redirect_to)
                        return navigate(data.data.redirect_to, { state: { status: 'CREATED' }, replace: true })
                    return navigate('/dashboard', { replace: true })
                }
                if (data && data.status === 'error') {
                    console.error('data.error :::: ', data.error)
                    setAlert({ type: 'danger', message: data.error as string })
                    return;
                }
                if (data && data.status === 'unknown_error') {
                    console.error('data.error :::: ', data.error)
                    setAlert(null)
                    return;
                }
            },
            onError: () => {
                console.error('error :::: ', registerMutation)
            }
        })

    }

    return (
        <section className='fixed inset-0 z-50 bg-black/30 block py-10 px-2 min-h-screen overflow-y-auto'>
            <div className='flex items-center justify-center min-h-full'>
                <div className='bg-white p-10 rounded-3xl max-w-[414px] box-border w-full relative'>
                    <button onClick={() => handleModal(null)} className='absolute right-4 top-3 p-1 rounded-lg text-black/60 hover:text-black duration-300 cursor-pointer'>
                        <svg height={20} width={20} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className='text-3xl font-bold txt-gradient mb-6 text-center'>Join LinkSot!</div>
                    <form onSubmit={handleRegister} noValidate>
                        {/* Name */}
                        <TextBox
                            id='name'
                            value={name}
                            onChange={e => setName(e.currentTarget.value)}
                            label='Name'
                            type='text'
                            wrapperClass='mb-4'
                            placeholder='John Doe'
                            error={formError.name}
                        />
                        {/* Email */}
                        <TextBox
                            id='email'
                            value={email}
                            onChange={e => setEmail(e.currentTarget.value)}
                            label='Email'
                            type='email'
                            wrapperClass='mb-4'
                            placeholder='your.email@example.com'
                            error={formError.email}
                        />
                        <TextBox
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.currentTarget.value)}
                            label="Password"
                            type={isPasswordVisible ? 'text' : 'password'}
                            wrapperClass='mb-4'
                            placeholder="••••••••"
                            error={formError.password}
                            postfixIcon={
                                <span className='cursor-pointer self-center opacity-85 hover:opacity-100'>
                                    <IconEye size={20} className={isPasswordVisible ? 'block' : 'hidden'} onClick={() => setIsPasswordVisible(!isPasswordVisible)} />
                                    <IconEyeOff size={20} className={isPasswordVisible ? 'hidden' : 'block'} onClick={() => setIsPasswordVisible(!isPasswordVisible)} />
                                </span>}
                        />
                        {/* Confirm Password */}
                        <TextBox
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.currentTarget.value)}
                            label="Confirm password"
                            type={isConfirmPasswordVisible ? 'text' : 'password'}
                            wrapperClass='mb-4'
                            placeholder="••••••••"
                            error={formError.confirmPassword}
                            postfixIcon={
                                <span className='cursor-pointer self-center opacity-85 hover:opacity-100'>
                                    <IconEye size={20} className={isConfirmPasswordVisible ? 'block' : 'hidden'} onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} />
                                    <IconEyeOff size={20} className={isConfirmPasswordVisible ? 'hidden' : 'block'} onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} />
                                </span>}
                        />
                        {alert && <Alert type={alert.type} message={alert.message} className='mb-6' />}
                        {/* Submit */}
                        <Button type='submit' isPending={isPending} label='Register' variant='primary' />
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account? <a href="#" className="text-purple-600 hover:text-purple-800 font-medium" onClick={() => handleModal('login')}>Login</a>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Register