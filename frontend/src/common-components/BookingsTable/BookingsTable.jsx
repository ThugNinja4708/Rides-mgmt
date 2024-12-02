import "./BookingsTable.css";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { axios } from "lib/axios";
import { DateComponent } from "common-components/DateComponent/DateComponent";
import Spinner from "common-components/Spinner/Spinner";

export const BookingsTable = ({ ride }) => {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const columnDef = [
        {
            headerName: "Rider Name",
            field: "rider_name",
            valueFormatter: (params)=>params.value.charAt(0).toUpperCase() + params.value.slice(1),
        },
        {
            headerName: "Payment Status",
            field: "payment_details.payment_status",
            valueFormatter: (params)=>params.value.charAt(0).toUpperCase() + params.value.slice(1),
        },
        {
            headerName: "Payment Time",
            field: "payment_details.payment_date",
            cellRenderer: (params) => {
                const date = new Date(params.value);
                const formattedDate = date.toISOString().split("T")[0];
                const time = `${date.getHours()}:${date.getHours()}`
                return (
                    <DateComponent date={formattedDate} time={time}/>
                );
            }
        },
        {
            headerName: "Payment Method",
            field: "payment_details.payment_method"
        },
        // {
        //     headerName: "Created At",
        //     field: "created_at",
        //     cellRenderer: (params) => {
        //         const date = new Date(params.value);
        //         const formattedDate = date.toISOString().split("T")[0];
        //         const time = `${date.getHours()}:${date.getHours()}`
        //         return (
        //             <DateComponent date={formattedDate} time={time}/>
        //         );
        //     }
        // }
    ];
    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("/driver/get_bookings", {
                ride_id: ride._id
            });
            setRowData(response.data.data.bookings);
        } catch (error) {
            console.error("Error fetching rides:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    return isLoading ? (
        <Spinner/>
    ) : (
        <div>
            <div className="ag-theme-quartz" style={{ height: "20rem", width: "100%" }}>
                <AgGridReact rowData={rowData} columnDefs={columnDef} />
            </div>
        </div>
    );
};
