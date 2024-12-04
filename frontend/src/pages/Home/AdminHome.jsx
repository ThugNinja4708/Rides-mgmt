import Spinner from "common-components/Spinner/Spinner";
import React, { useCallback, useEffect, useState } from "react";
import { axios } from "lib/axios";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { AgGridReact } from "ag-grid-react";
import { DateComponent } from "common-components/DateComponent/DateComponent";
import { Dialog } from "primereact/dialog";
import { BookingsTable } from "common-components/BookingsTable/BookingsTable";

export const AdminHome = () => {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchString, setSearchString] = useState();
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [gridApi, setGridApi] = useState();
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState(null);
    const [currentRide, setCurrentRide] = useState();
    const columnDef = [
        {
            headerName: "Pickup Location",
            field: "pickup_location.coordinates.location"
        },
        {
            headerName: "Drop Location",
            field: "drop_location.coordinates.location"
        },
        {
            headerName: "Driver",
            field: "driver_name",
            valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1)
        },
        {
            headerName: "Status",
            field: "status"
        },
        {
            headerName: "Start Time",
            field: "start_time",
            cellRenderer: (params) => {
                const date = new Date(params.value);
                const formattedDate = date.toISOString().split("T")[0];
                const time = `${date.getHours()}:${date.getMinutes()}`;
                return <DateComponent date={formattedDate} time={time} />;
            }
        },
        {
            headerName: "Total seats booked",
            field: "list_of_riders",
            valueFormatter: (params) => params.value.length
        },
        {
            headerName: "Admin Comission",
            field: "admin_commission"
        }
    ];
    const handleSearch = useCallback((e) => {
        const value = e.target.value;
        setSearchString(value);
    }, []);

    const renderBookingsTable = useCallback(() => {
        return <BookingsTable ride={currentRide} />;
    },[currentRide]);

    const fetchRides = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/admin/get_all_rides");
            setRowData(response.data.data.list_of_rides);
            setTotalEarnings(response.data.data.admin_earnings);
        } catch (error) {
            console.error("Error fetching rides:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const showBookings = (params) => {
        setCurrentRide(params.data);
        setVisible(true);
        setActionPerformed("showBookings");
    };
    const actions = {
        showBookings: {
            header: () => (
                <>
                    Bookings for {currentRide.pickup_location.coordinates.location} <i className="pi pi-arrow-right" />{" "}
                    {currentRide.drop_location.coordinates.location}
                </>
            ),
            content:renderBookingsTable,
            footer: ()=><>Footer</>,
            style: { width: "52rem" }
        }
    };
    const onCancelDialog = () => {
        setVisible(false);
    };

    return isLoading ? (
        <Spinner />
    ) : (
        <div>
            <div className="search-container">
                <IconField iconPosition="left" className="search-field">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText
                        value={searchString}
                        placeholder="Search bookings..."
                        className="rides-search"
                        onChange={handleSearch}
                    />
                </IconField>
                <span className="t14-sb earnings"> Total Earnings: ${totalEarnings}</span>
            </div>
            <div className="ag-theme-quartz" style={{ height: "20rem", width: "100%" }}>
                <AgGridReact
                    quickFilterText={searchString}
                    onGridReady={onGridReady}
                    rowData={rowData}
                    columnDefs={columnDef}
                    onRowClicked={showBookings}
                />
            </div>
            <Dialog
                header={actions[actionPerformed]?.header()}
                visible={visible}
                onHide={onCancelDialog}
                footer={actions[actionPerformed]?.footer()}
                style={actions[actionPerformed]?.style}
            >
                {actions[actionPerformed]?.content()}
            </Dialog>
        </div>
    );
};
