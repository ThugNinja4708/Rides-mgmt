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
    return (
        <CustomDialog
            header="Something went wrong"
            visible={!!error}
            style={{ width: "50vw" }}
            onHide={onHide}
            footer={<Button label="OK" className="input-buttons" onClick={onHide} />}
            headerStyle= {{color: "#ef4444"}}
            >
            <div className="error-content t16-sb">{error?.message}</div>
        </CustomDialog>
    );
}