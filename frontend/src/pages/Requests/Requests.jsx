import "./Requests.css"
import React, { useCallback, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { axios } from "lib/axios";
import Spinner from "common-components/Spinner/Spinner";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { Button } from "primereact/button";
import useError from "hooks/useError";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
const Requests = () => {

    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState({ fetchRequests: false, approveOrReject: false });
    const [searchString, setSearchString] = useState();
    const [gridApi, setGridApi] = useState();
    const [currentRequest, setCurrentRequest] = useState();
    const { setErrorRef } = useError();
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState(null);
    const columnDef = [
        {
            headerName: "Username",
            field: "username"
        }, {
            headerName: "Email",
            field: "email",
        }, {
            headerName: "Phone Number",
            field: "phone_number",
        }, {
            headerName: "License Number",
            field: "license_number",
        }, {
            headerName: "SSN",
            field: "ssn",
        }, {
            headerName: "City",
            field: "city",
        }, {
            headerName: "street",
            field: "street",
        }

    ];

    const handleSearch = useCallback((e) => {
        const value = e.target.value;
        setSearchString(value);
    }, []);

    const fetchRequests = useCallback(async () => {
        setIsLoading((prev) => ({ ...prev, fetchRequests: true }));
        try {
            const response = await axios.get("/admin/get_requests");
            console.log(response);

            setRowData(response.data.data);
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, fetchRequests: false }));
        }
    }, []);
    const approveOrReject = useCallback(async (action) => {
        try {
            setIsLoading((prev) => ({ ...prev, approveOrReject: true }))
            const response = await axios.post("/admin/approve_driver", {
                action: action,
                driver_id: currentRequest.id
            })

        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, approveOrReject: false }))
            onCancelDialog();
        }

    }, [currentRequest])

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);
    const renderRequest = () => {
        return (<div style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <span className="t14-sb"> Username</span>
                <span className="t14"> {currentRequest.username} </span>
            </div>
            <div>
                <span className="t14-sb"> Email</span>
                <span className="t14"> {currentRequest.email}</span>
            </div>

            <div>
                <span className="t14-sb"> License Number</span>
                <span className="t14"> {currentRequest.license_number}</span>
            </div>
            <div>
                <span className="t14-sb"> SSN</span>
                <span className="t14"> {currentRequest.ssn}</span>
            </div>
            <div>
                <span className="t14-sb"> City</span>
                <span className="t14"> {currentRequest.city}</span>
            </div>

        </div>)
    }
    const renderFooter = () => {
        return (<>
            <Button
                label="Reject"
                onClick={() => approveOrReject("reject")}
            />
            <Button
                label="approve"
                onClick={() => approveOrReject("approve")}
            />

        </>)
    }

    const actions = {
        showRequest: {
            header: () => (
                isLoading.approveOrReject ? <Spinner /> :
                    <>
                        Approve or Reject this user
                    </>
            ),
            content: renderRequest,
            footer: () => renderFooter,
            className: "dialog-sm"
        }
    };
    const onCancelDialog = () => {
        setVisible(false);
        setActionPerformed(null);
    }

    return isLoading ? (
        <Spinner />
    ) : (
        <div>
            <div className="search-container">
                <IconField iconPosition="left" className="search-field">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText value={searchString} placeholder="Search bookings..." className="rides-search" onChange={handleSearch} />
                </IconField>
            </div>
            <div className="ag-theme-quartz" style={{ height: "20rem", width: "100%" }}>
                <AgGridReact
                    quickFilterText={searchString}
                    onGridReady={onGridReady}
                    rowData={rowData}
                    columnDefs={columnDef}
                    onRowClicked={(params) => {
                        setCurrentRequest(params.data);
                        setVisible(true);
                        setActionPerformed("showRequest");
                    }}
                />

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
    );
}
export default Requests;