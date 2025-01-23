import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    user: User | null;
    isGuest: boolean;
}

const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: true,
        user: null,
        isGuest: true
    });

    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

                if (!token || !user) {
                    setAuthState({
                        isAuthenticated: false,
                        isAdmin: false,
                        isLoading: false,
                        user: null,
                        isGuest: true
                    });
                    return;
                }

                const isAdmin = user.role === 'admin';

                setAuthState({
                    isAuthenticated: true,
                    isAdmin,
                    isLoading: false,
                    user,
                    isGuest: false
                });
            } catch (error) {
                console.error('Error checking auth status:', error);
                setAuthState({
                    isAuthenticated: false,
                    isAdmin: false,
                    isLoading: false,
                    user: null,
                    isGuest: true
                });
            }
        };

        checkAuthStatus();

        const handleStorageChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return authState;
};

export default useAuth;