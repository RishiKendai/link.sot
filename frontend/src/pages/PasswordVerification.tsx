import React, { useState } from 'react';
import Button from '../components/ui/button/Button';
import TextBox from '../components/ui/inputs/TextBox';
import IconShield from '../components/ui/icons/IconShield';
import clsx from 'clsx';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

const PasswordVerificationModal = () => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { short } = useParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const API_BASE = import.meta.env.VITE_FRONTEND_URL;
            const response = await fetch(`${API_BASE}/proxy/r/${short}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });
            if (response.ok) {
                const data = await response.json();
                const token = data.data.token;
                window.location.replace(`${API_BASE}/proxy/r/${short}/protected/${token}`);
                return;
            }

            // If not a redirect, try to parse JSON response (for errors)
            // const data = await response.json();

            // if (response.ok) {
                // This shouldn't happen with current server logic, but handle it
                // window.location.reload();
            // } else {
                // setError(data.error || data.message || 'Incorrect password');
            // }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                {/* Header */}
                <div className="flex flex-col items-center gap-3 mb-15">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <IconShield size={43} color="blue" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">This content is protected</h3>
                        <p className="text-gray-400 text-base text-center">Enter password to access the content</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <TextBox
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={clsx(
                                'w-full',
                                error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            )}
                            disabled={isLoading}
                        />
                        {error && (
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            label="Access Link"
                            className="flex-1 gpb"
                            isPending={isLoading}
                            disabled={!password.trim()}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordVerificationModal; 