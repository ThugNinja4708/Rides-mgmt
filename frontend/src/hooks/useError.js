import { useContext } from "react";
import { ErrorContext } from "context/errorContext/errorContextProvider";

const useError = () => {
    return useContext(ErrorContext);
};

export default useError;