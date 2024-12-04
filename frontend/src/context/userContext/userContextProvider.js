import { createContext, useState, useRef, useEffect } from "react";

export const UserContext = createContext(
    {
        user: null,
        isLoggedIn: false,
        setIsLoggedIn: () => {},
        setUser: () => {},
        authToken: "",
        setAuthToken: () => {}
    }
);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authToken, setAuthToken] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedAuthToken = localStorage.getItem('authToken');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }

        if (storedAuthToken) {
            setAuthToken(storedAuthToken);
        }
        setLoading(false);
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                isLoggedIn,
                setIsLoggedIn,
                authToken,
                setAuthToken,
                setUser,
                loading
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
