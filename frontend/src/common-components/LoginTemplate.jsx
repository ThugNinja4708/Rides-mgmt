import {useState, useEffect} from "react";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {Password} from "primereact/password";
import {Dropdown} from "primereact/dropdown";
import Image from "../../src/images/ride.png";
import "./LoginTemplate.css";
import { Link } from "react-router-dom";
export const LoginTemplate = ({title, inputs, buttonLabel, loginPrompt, linkText, linkHref, onSubmit}) => {
    const [inputData, setInputData] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const allFilled = inputs.every(input => {
            if (input.required) {
                return inputData[input.name] && inputData[input.name].trim() !== '';
            }
            return true;
        });
        setIsFormValid(allFilled);
    }, [inputData, inputs]);

    const handleInputChange = (e) => {
        setInputData({...inputData, [e.target.name]: e.target.value});
    }

    const handleInputDropdownChange = (e) => {
        setInputData({...inputData, [e.target.name]: e.value});
    }

    const handleSubmit = () => {
        onSubmit(inputData);
    }

    return (
        <div className="login-template-container">
            <div className="login-template-card">
            <div className="login-template-image">
                <img src={Image} alt="signup" />
            </div>
            <div className="login-template-form">
                    <div className="login-template-header"><h2 style={{color:"#1174c0"}}>{title}</h2></div>
                    <div className="login-template-inputs">
                    {inputs.map((input, index) => {
                        if (input.type === "text") {
                            return <InputText key={index} className="inputs" name={input.name} value={inputData[input.name] || ""} onChange={(e) => handleInputChange(e, input.name)} placeholder={input.placeholder} required/>;
                        } else if (input.type === "password") {
                            return <Password key={index} className="inputs" name={input.name} value={inputData[input.name] || ""} onChange={(e) => handleInputChange(e, input.name)} placeholder={input.placeholder} feedback={false} toggleMask required={input.required} />;
                        } else if (input.type === "dropdown") {
                            return <Dropdown key={index} className="inputs" name={input.name} value={inputData[input.name] || ""} options={input.options} onChange={(e) => handleInputDropdownChange(e, input.name)} placeholder={input.placeholder} required={input.required} />;
                        }
                        return null;
                    })}
                    </div>
                    <div className="login-template-button-container">
                    <Button label={buttonLabel} className="inputs" onClick={handleSubmit} disabled={!isFormValid}/>
                    <div>{loginPrompt} <span><Link to={linkHref}>{linkText}</Link></span></div>
                    </div>
            </div>
            </div>
        </div>
    )
}