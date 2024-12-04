import React from "react";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
import { Button } from "primereact/button";
import  useError  from "../../hooks/useError";
import "./ErrorDialog.css";
export const ErrorDialog = () => {
    const { error, setError } = useError();
    const onHide = () => {
        setError(null);
    };
    const onHandleClick = () => {
        setError(null);
        if(error?.status === 422) {
            localStorage.clear();
            window.location.replace("/login");
    }
}
    return (
        <CustomDialog
            header="Something went wrong"
            visible={!!error}
            style={{ width: "50vw" }}
            onHide={onHide}
            footer={<Button label={error?.status === 422 ? "Log Out" : "Ok"} className="input-buttons" onClick={onHandleClick} />}
            headerStyle= {{color: "#ef4444"}}
            >
            <div className="error-content t16-sb">{error?.status === 422 ? "Session Expired" : error?.message}</div>
        </CustomDialog>
    );
}