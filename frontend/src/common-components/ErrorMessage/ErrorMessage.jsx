import "./ErrorMessage.css";
export const ErrorMessage = ({message, className}) => {
    return (
        <div className={message !== "" ? `error-message message-visible ${className}` : `error-message message-hidden ${className}`}>
            <i className="pi pi-times-circle"></i>
            <span> {message}</span>
        </div>
    );
}