// import { useNavigate } from 'react-router-dom';
export default function NotFound() {
    // const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-none">
                        404
                    </h1>
                </div>

                {/* Main Message */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                    </p>
                </div>


                {/* Decorative Elements */}
                <div className="mt-12 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
