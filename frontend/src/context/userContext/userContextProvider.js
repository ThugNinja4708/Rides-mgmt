import { createContext, useState, useRef } from "react";

export const UserContext = createContext(
    {
        user: null,
        isLoggedIn: false,
        setIsLoggedIn: () => {},
    }
);

export const UserProvider = ({ children }) => {
    const user = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <UserContext.Provider
            value={{
                user: user.current,
                isLoggedIn,
                setIsLoggedIn
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
