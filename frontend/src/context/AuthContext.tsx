// context/AuthContext.tsx
import { createContext, useEffect, useState } from 'react';

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
const API_BASE = import.meta.env.VITE_FRONTEND_URL || '';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        console.count('called')
        const checkAuthStatus = async () => {
            try {

                const res = await fetch(`${API_BASE}/proxy/auth-status`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (res.ok) {
                    const responseData = await res.json();
                    const { data } = responseData;
                    console.log('authenticated', data);
                    setAuthenticated(true);
                    setUser({ name: data.name, email: data.email });
                    if (window.location.pathname === '/') {
                        window.history.pushState({}, '', '/links')
                    }
                } else {
                    setAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.log('error', error);
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
