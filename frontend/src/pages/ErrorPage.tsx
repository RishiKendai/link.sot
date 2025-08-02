// ErrorPage.jsx
import { useNavigate, useRouteError } from 'react-router-dom';
import IconUnLink from '../components/ui/icons/IconUnlink';
import Button from '../components/ui/button/Button';

export default function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    console.error(error);
    return (
        <section className='flex flex-col items-center justify-center min-h-screen w-full py-8 px-5'>
            <span className='mb-4 grc p-6 rounded-full text-white'>
                <IconUnLink size={52} />
            </span>
            <h1 className='text-2xl font-bold text-center mb-2'>Oops! Looks like something went wrong</h1>
            <p className='text-gray-600 text-center'>We're sorry, but an unexpected error occurred. Please try again later</p>
            {/* <a href="/" className="btn gor mt-4">Go Home</a> */}
            <Button label='Back to Home' className='gor mt-6' onClick={() => navigate('/links')} isPending={false} />

        </section>
    );
}
