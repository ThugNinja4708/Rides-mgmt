import { createContext, useState, useRef } from "react";

export const UserContext = createContext(
    {
        user: null,
        isLoggedIn: false,
        setIsLoggedIn: () => {},
        setUser: () => {}
    }
);

export const UserProvider = ({ children }) => {
    const [user,setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // const setUser = (newUser) => {
    //     user.current = newUser;
    // };

    return (
        <UserContext.Provider
            value={{
                user: user,
                isLoggedIn,
                setIsLoggedIn,
                setUser
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
