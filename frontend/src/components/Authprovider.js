import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Define the AuthProvider component
const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};

// Define the useAuth hook to consume the context
const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthProvider, useAuth };