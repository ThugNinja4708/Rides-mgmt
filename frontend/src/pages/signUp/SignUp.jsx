import { useNavigate } from "react-router-dom";
import { LoginTemplate } from "../../common-components/LoginTemplate";
import { signUpAPI } from "./SignUpApi";
import useError from "hooks/useError";
export const SignUp = () => {
    const navigate = useNavigate();
    const inputs = [

        { type: "text", name: "username", placeholder: "Username", required: true },
        { type: "text", name: "email", placeholder: "Email", required: true },
        { type: "text", name: "city", placeholder: "City", required: true },
        { type: "text", name: "state", placeholder: "State", required: true },
        { type: "text", name: "phone", placeholder: "Phone Number", required: false },
        { type: "text", name: "ssn", placeholder: "SSN number", required: true },
        { type: "password", name: "password", placeholder: "Password", required: true },
        
        {
            type: "dropdown", name: "role", placeholder: "Select a role", required: true, options: [
                { label: "Driver", value: "driver" },
                { label: "Rider", value: "rider" }
            ]
        }
    ];
    const { setErrorRef } = useError();

    const handleSubmit = async (inputData) => {
        try {
            const response = await signUpAPI(inputData);
            if (response.status === 201) {
                navigate("/login")
            }
            console.log(response);
        } catch (error) {
            setErrorRef.current(error);
        }
    }
    return (
        <LoginTemplate
            title="Sign Up"
            inputs={inputs}
            buttonLabel="Sign Up"
            loginPrompt="Already have an account?"
            linkText="Log in"
            linkHref="/login"
            onSubmit={handleSubmit}
        />
    )
}