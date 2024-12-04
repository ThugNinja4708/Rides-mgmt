import { createContext, useState, useRef } from "react";

export const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const setErrorRef = useRef(setError);
    return <ErrorContext.Provider value={{ error, setError, setErrorRef }}>{children}</ErrorContext.Provider>;
};
