// context/AuthContext.tsx
import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
export interface User {
    name: string;
    email: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    setAuthenticated: (value: boolean) => void;
    isLoading: boolean;
    user: User | null;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const API_BASE = import.meta.env.VITE_API_DOMAIN || '';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const [isAuthenticated, setAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        console.count('called')
        const checkAuthStatus = async () => {
            try {

                // const res = await fetch(`${API_BASE}/auth-status`, {
                const res = await fetch(`/proxy/auth-status`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const responseData = await res.json();
                if (res.ok) {
                    const { data } = responseData;
                    setAuthenticated(true);
                    setUser({ name: data.name, email: data.email });
                    if (window.location.pathname === '/') {
                        navigate('/links', { replace: true })
                    }
                } else if (res.status === 401 && responseData.error === 'session_expired') {
                    toast.error("Your session has expired.");
                    setTimeout(() => {
                        setAuthenticated(false);
                        setUser(null);
                        window.location.href = '/';
                    }, 1000)
                } else {
                    setAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('error', error);
                setAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, isLoading, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
