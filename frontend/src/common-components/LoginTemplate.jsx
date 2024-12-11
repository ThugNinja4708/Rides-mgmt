import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import Image from "../../src/images/ride.png";
import "./LoginTemplate.css";
import { ErrorMessage } from "./ErrorMessage/ErrorMessage";
import { useNavigate } from "react-router-dom";
import { axios } from "lib/axios";
import useError from "hooks/useError";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
export const LoginTemplate = ({ title, inputs, buttonLabel, loginPrompt, linkText, linkHref, onSubmit }) => {
    const [inputData, setInputData] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState(null);
    const [isLoading, setIsLoading] = useState({ resetPassword: false });
    const [forgotPassword, setForgotpassword] = useState({ email: "", role: "" });
    const { setErrorRef } = useError();
    useEffect(() => {
        const allFilled = inputs.every(input => {
            if (input.required) {
                return inputData[input.name] && inputData[input.name].trim() !== '';
            }
            return true;
        });
        const valid = allFilled && errorMessage === "";
        setIsFormValid(valid);
    }, [inputData, inputs]);

    useEffect(() => {
        setInputData({});
    }, [linkHref]);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9- ]+$/;
    const phoneRegex = /^[1-9][0-9]{9}$/;
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;

    const handleInputChange = (e) => {
        setInputData({ ...inputData, [e.target.name]: e.target.value });
        if (e.target.name === "email" && !emailRegex.test(e.target.value)) {
            setErrorMessage("Invalid email");
        } else if (e.target.name === "username" && !usernameRegex.test(e.target.value)) {
            setErrorMessage("Invalid username");
        } else if (e.target.name === "phone" && !phoneRegex.test(e.target.value)) {
            setErrorMessage("Phone number should contain 10 digits");
        }
        else if (e.target.name === "ssn" && !ssnRegex.test(e.target.value)) {
            setErrorMessage("SSN number should be in the format 123-45-6789");
        }
        else if (e.target.name === "city" && !e.target.value) {
            setErrorMessage("City is required");
        }
        else if (e.target.name === "state" && !(e.target.value)) {
            setErrorMessage("State is required");
        }
        else {
            setErrorMessage("");
        }
    }

    const handleInputDropdownChange = (e) => {
        setInputData({ ...inputData, [e.target.name]: e.value });
    }

    const handleSubmit = () => {
        onSubmit(inputData);
    }

    const renderForgotPassword = () => {
        return (<div>
            <InputText className="inputs"
                value={forgotPassword.email}
                onChange={(e) => setForgotpassword((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={"email"} required
            />;
            <Dropdown className="inputs"
                value={forgotPassword.role}
                onChange={(e) => setForgotpassword((prev) => ({ ...prev, role: e.value }))}
                placeholder={"role"} required
                options={[
                    { label: "Driver", value: "driver" },
                    { label: "Rider", value: "rider" }
                ]}
            />;
        </div>)
    }
    const forgotPasswordSubmit = () => {
        try {
            const response = axios.post("/auth/forgot_password", {
                "email": forgotPassword.email,
                "role": forgotPassword.role
            })
        } catch (error) {
            setErrorRef.current(error);
        } finally {

        }

    }
    const renderFooter = () => {
        return (<>
            <Button
                label="submit"
                onClick={() => forgotPasswordSubmit()}
            />

        </>)
    }
    const actions = {
        forgotPassworrd: {
            header: () => (<>Forgot Passworrd</>),
            content: renderForgotPassword,
            footer: () => renderFooter,
            className: "dialog-sm"
        }
    };
    const onCancelDialog = () => {
        setVisible(false);
        setActionPerformed(null);
    }

    return (
        <div className="login-template-container">
            <div className="login-template-card">
                <div className="login-template-image">
                    <img src={Image} alt="signup" />
                </div>
                <div className="login-template-form t14">
                    <div className="login-template-header"><h2 style={{ color: "#1174c0" }}>{title}</h2></div>
                    <div className="login-template-inputs">
                        {inputs.map((input, index) => {
                            if (input.type === "text") {
                                return <InputText key={index} className="inputs" name={input.name} value={inputData[input.name] || ""} onChange={(e) => handleInputChange(e, input.name)} placeholder={input.placeholder} required />;
                            } else if (input.type === "password") {
                                return <Password key={index} className="inputs" name={input.name} value={inputData[input.name] || ""} onChange={(e) => handleInputChange(e, input.name)} placeholder={input.placeholder} feedback={false} toggleMask required={input.required} />;
                            } else if (input.type === "dropdown") {
                                return <Dropdown key={index} className="inputs" name={input.name} value={inputData[input.name] || ""} options={input.options} onChange={(e) => handleInputDropdownChange(e, input.name)} placeholder={input.placeholder} required={input.required} />;
                            }
                            return null;
                        })}
                    </div>
                    <div className="login-template-button-container">
                        <ErrorMessage message={errorMessage} className="login-template-error" />
                        <Button label={buttonLabel} className="inputs" onClick={handleSubmit} disabled={!isFormValid} />
                        <div className="login-prompt">{loginPrompt} <Button text onClick={() => { navigate(linkHref) }} label={linkText} /></div>
                        <div>
                            <Button label="forgot password?" text onClick={() => {setVisible(true); setActionPerformed("forgotPassworrd") }} />
                        </div>
                    </div>
                </div>
            </div>
            <CustomDialog
                header={actions[actionPerformed]?.header()}
                visible={visible}
                onHide={onCancelDialog}
                footer={actions[actionPerformed]?.footer()}
                className={actions[actionPerformed]?.className}
            >
                {actions[actionPerformed]?.content()}
            </CustomDialog>
        </div>
    )
}