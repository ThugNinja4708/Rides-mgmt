import "./ErrorMessage.css";
export const ErrorMessage = ({message}) => {
    return (
        <div className={message !== "" ? "error-message message-visible" : "error-message message-hidden"}>
            <i className="pi pi-times-circle"></i>
            <span> {message}</span>
        </div>
    );
}