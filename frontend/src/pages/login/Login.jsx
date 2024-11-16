import { LoginTemplate } from "../../common-components/LoginTemplate";
import {loginAPI} from "./LoginAPI"
import useAuth from "../../hooks/useAuth";
export const Login = () => {
    const {user, isLoggedIn} = useAuth();
    const inputs = [
        {type: "text", name: "username", placeholder: "Username", required: true},
        {type: "text", name: "email", placeholder: "Email", required: true},
        {type: "password", name: "password", placeholder: "Password", required: true},
        {type: "dropdown", name: "role", placeholder: "Select a role", required: true, options: [
            {label: "Driver", value: "driver"},
            {label: "Rider", value: "rider"}
        ]}
    ]

    const handleSubmit = async (inputData) => {
        const response = await loginAPI(inputData)
        console.log(response);
}
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
    )
}