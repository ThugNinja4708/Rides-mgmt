import { createContext, useState, useEffect, useCallback } from "react";
import { axios } from "lib/axios";
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


    const fetchUserDetails = useCallback(async () => {

        try {
            const response = await axios.get("/auth/get_user_details");
            if(response.status === 200){
                setUser(response.data?.data);
                const authToken = localStorage.getItem("authToken");
                if(authToken){
                    setAuthToken(authToken);
                    setIsLoggedIn(true);
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }

    },[]);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

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
