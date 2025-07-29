import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
// import Loader from '../components/ui/Loader';

const PublicLink: React.FC = () => {
    const { short } = useParams<{ short: string }>();

    // const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!short) {
            setError('Invalid link');
            // setIsLoading(false);
            return;
        }

        checkLinkStatus();
    }, [short]);

    const checkLinkStatus = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL;
            console.log(`check:: ${API_BASE}/api/v1/r/${short}`)
            window.location.href = `${API_BASE}/api/v1/r/${short}`;
        } catch (err) {
            console.error('this ', err);
            setError('Something went wrong. Please try again.');
        }
    };

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="text-center">
    //                 <Loader color="#1B2A36" />
    //                 <p className="mt-4 text-gray-600">Checking link...</p>
    //             </div>
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Error</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="bottom-left" />
        </>
    );
};

export default PublicLink; 