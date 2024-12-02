import "./BookingsTable.css";
import React, { useCallback, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { axios } from "lib/axios";
import { DateComponent } from "common-components/DateComponent/DateComponent";
import Spinner from "common-components/Spinner/Spinner";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";

export const BookingsTable = ({ ride }) => {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchString, setSearchString] = useState();
    const [earnings, setEarnings] = useState(0);
    const [gridApi, setGridApi] = useState();
    const columnDef = [
        {
            headerName: "Rider Name",
            field: "rider_name",
            valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1),
        },
        {
            headerName: "Rider Pickup Location",
            field: "rider_pickup_location.name"
        },

        {
            headerName: "Payment Status",
            field: "payment_details.payment_status",
            valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1),
        },
        {
            headerName: "Payment Time",
            field: "payment_details.payment_date",
            cellRenderer: (params) => {
                const date = new Date(params.value);
                const formattedDate = date.toISOString().split("T")[0];
                const time = `${date.getHours()}:${date.getHours()}`
                return (
                    <DateComponent date={formattedDate} time={time} />
                );
            }
        },
        {
            headerName: "Payment Method",
            field: "payment_details.payment_method"
        }
    ];

    const handleSearch = useCallback((e) => {
        const value = e.target.value;
        setSearchString(value);
    }, []);

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("/driver/get_bookings", {
                ride_id: ride._id
            });
            setRowData(response.data.data.bookings);
            setEarnings(response.data.data.earnings);
        } catch (error) {
            console.error("Error fetching rides:", error);
        } finally {
            setIsLoading(false);
        }
    }, [ride]);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    return isLoading ? (
        <Spinner />
    ) : (
        <div>
            <div className="search-container">
                <IconField iconPosition="left" className="search-field">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText value={searchString} placeholder="Search bookings..." className="rides-search" onChange={handleSearch} />
                </IconField>
                <span className="t14-sb earnings"> Total Earnings: ${earnings}</span>
            </div>
            <div className="ag-theme-quartz" style={{ height: "20rem", width: "100%" }}>
                <AgGridReact
                    quickFilterText={searchString}
                    onGridReady={onGridReady}
                    rowData={rowData}
                    columnDefs={columnDef} />
            </div>
        </div>
    );
};
