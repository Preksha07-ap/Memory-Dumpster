import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            setUser(JSON.parse(storedProfile));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('userProfile', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
