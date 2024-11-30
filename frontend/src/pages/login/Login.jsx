import { LoginTemplate } from "../../common-components/LoginTemplate";
import { loginAPI } from "./LoginAPI";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export const Login = () => {
    const { user, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();
    const inputs = [
        { type: "text", name: "username", placeholder: "Username", required: true },
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

    const handleSubmit = async (inputData) => {
        const response = await loginAPI(inputData);
        localStorage.setItem('authToken', response.data.authToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsLoggedIn(true);
        user.current = response?.data?.user;
        navigate("/");
    };

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        if (authToken && userData) {
            setIsLoggedIn(true);
            user.current = JSON.parse(userData);
            navigate("/");
        }
    }, [navigate,setIsLoggedIn, user]);

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
