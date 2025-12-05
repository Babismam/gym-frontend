
import React, { createContext, useState, useEffect, useContext } from 'react'; 
import { getToken, getUserId, getUsername, getUserRole, getFirstName, logout } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = getToken();
        if (storedToken) {
            setToken(storedToken);
            setUser({
                id: getUserId(),
                username: getUsername(),
                role: getUserRole(),
                firstName: getFirstName()
            });
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (authData) => {
        setToken(authData.token);
        setUser({
            id: authData.id,
            username: authData.username,
            role: authData.role,
            firstName: authData.firstName
        });
    };

    const handleLogout = () => {
        logout(); 
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        handleLogin,
        handleLogout, 
        isLoggedIn: !!token,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};