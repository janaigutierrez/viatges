// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth ha de ser usat dins d\'un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar si hi ha token al localStorage en carregar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await getMe();
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error verificant autenticació:', error);
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await loginApi({ email, password });
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            setUser(userData);
            setIsAuthenticated(true);

            toast.success('Login correcte!');
            return true;
        } catch (error) {
            const message = error.response?.data?.error || 'Error al fer login';
            toast.error(message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Sessió tancada');
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};