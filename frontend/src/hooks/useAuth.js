import { useContext } from "react";
import { UserContext } from "../context/userContext/userContextProvider";

const useAuth = () => {
    return useContext(UserContext);
};

export default useAuth;