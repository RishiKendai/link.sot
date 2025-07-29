import { useEffect, useState } from 'react'
import TextBox from './ui/inputs/TextBox';
import Alert, { type AlertProps } from './ui/Alert';
import IconEye from './ui/icons/IconEye';
import IconEyeOff from './ui/icons/IconEyeOff';

type modalState = 'login' | 'register' | null

interface RegisterProps {
    handleModal: (state: modalState) => void
}

function Register({ handleModal }: RegisterProps) {

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
                    <div className="relative flex items-center justify-center py-4">
                        <div className="w-full border-t border-gray-300"></div>
                        <span className="px-3 bg-white text-gray-500 text-sm">OR</span>
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
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
                    {/* Password */}
                    {/* <div className='flex flex-col mb-6'>
                        <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor="password">Password</label>
                        <input className='w-full input-field rounded-lg px-4 py-2 text-base' type="password" name="" id="password" placeholder='••••••••' />
                        <span className="form-error"></span>
                    </div> */}
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
                    <button className="w-full h-10 rounded text-lg leading-tight btn btn-animate bg-black  cursor-pointer"><span className="text-white font-bold text-md">Register</span></button>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account? <a href="#" className="text-purple-600 hover:text-purple-800 font-medium" onClick={() => handleModal('login')}>Login</a>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Register