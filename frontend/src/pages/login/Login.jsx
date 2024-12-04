import { LoginTemplate } from "../../common-components/LoginTemplate";
import { loginAPI } from "./LoginAPI";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useError from "hooks/useError";
export const Login = () => {
    const { setUser, setIsLoggedIn, setAuthToken } = useAuth();
    const navigate = useNavigate();
    const inputs = [
        { type: "text", name: "email", placeholder: "Email", required: true },
        { type: "password", name: "password", placeholder: "Password", required: true },
        {
            type: "dropdown",
            name: "role",
            placeholder: "Select a role",
            required: true,
            options: [
                { label: "Driver", value: "driver" },
                { label: "Rider", value: "rider" },
                { label: "Admin", value: "admin" }
            ]
        }
    ];
    const { setErrorRef } = useError();

    const handleSubmit = async (inputData) => {
        try {
            const response = await loginAPI(inputData);
            if(response.status === 200){
                localStorage.setItem('authToken', response.data.authToken);
                setUser(response?.data?.user);
                setAuthToken(response?.data?.authToken);
                setIsLoggedIn(true);
                navigate("/");
            }
        } catch(error){
            setErrorRef.current(error);
    }
};

    return (
        <LoginTemplate
            title="Log In"
            inputs={inputs}
            buttonLabel="Log In"
            loginPrompt="Don't have an account?"
            linkText="Register"
            linkHref="/signUp"
            onSubmit={handleSubmit}
        />
    );
};
