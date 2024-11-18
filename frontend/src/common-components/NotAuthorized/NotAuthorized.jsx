import "./NotAuthrozied.css";
import { useNavigate } from "react-router-dom";
import notAuthorizedImage from "../../images/401.jpg";
import {Button} from "primereact/button";
const NotAuthorized = () => {
    const navigate = useNavigate();
    return (
        <div className="not-authorized-container">
            <img src={notAuthorizedImage} alt="not authorized"/>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
    );
};

export default NotAuthorized;
