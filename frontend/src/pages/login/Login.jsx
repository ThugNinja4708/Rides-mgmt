import { LoginTemplate } from "../../common-components/LoginTemplate";
export const Login = () => {
    const inputs = [
        {type: "text", name: "username", placeholder: "Username", required: true},
        {type: "text", name: "email", placeholder: "Email", required: true},
        {type: "password", name: "password", placeholder: "Password", required: true},
        {type: "dropdown", name: "role", placeholder: "Select a role", required: true, options: [
            {label: "Driver", value: "driver"},
            {label: "Passenger", value: "passenger"}
        ]}
    ]

    const handleSubmit = async (inputData) => {
        console.log(inputData);
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