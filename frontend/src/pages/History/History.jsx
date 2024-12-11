import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { TabView, TabPanel } from "primereact/tabview";
import "./History.css";
import { RideCard } from "common-components/RideCard/RideCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { axios } from "lib/axios";
import { searchRidesByInput } from "lib/utils";
import Spinner from "common-components/Spinner/Spinner";
import useError from "hooks/useError";
import { Button } from "primereact/button";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
export const History = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState({ cancelRide: false, fetchRides: false });
    const [listOfRides, setListOfRides] = useState([]);
    const [searchString, setSearchString] = useState();
    const [filteredData, setFilteredData] = useState([]);
    const statusMapping = useMemo(() => ["scheduled", "completed", "cancelled"], []);
    const { setErrorRef } = useError();
    const [currentRide, setCurrentRide] = useState();
    const [actionPerformed, setActionPerformed] = useState(null);
    const [visible, setVisible] = useState(false);
    const fetchRides = useCallback(async (status) => {
        try {
            setIsLoading((prev) => ({ ...prev, fetchRides: true }));
            const response = await axios.post("/rider/get_all_rides_by_status", {
                status,
            });
            setListOfRides(response.data.data);
            setFilteredData(response.data.data);
        } catch (error) {
            setErrorRef.current(error);
        }
        finally {
            setIsLoading((prev) => ({ ...prev, fetchRides: false }));
        }
    }, []);

    const handleSearch = useCallback((value) => {
        setSearchString(value);
        setFilteredData(searchRidesByInput(value, listOfRides))
    }, [listOfRides, activeIndex])

    const cancelRide = async (ride) => {
        try {
            setIsLoading((prev) => ({ ...prev, cancelRide: true }));
            const response = await axios.post("/rider/cancel_ride", {
                ride_id: currentRide._id
            })
        } catch (error) {
            setErrorRef.current(error)
        } finally {
            setIsLoading((prev) => ({ ...prev, cancelRide: false }));
            onCancelDialog();
        }
    }

    const getCancelRideDiable = (ride) => {
        if (!(ride.status !== "cancelled" && ride.status !=="completed")) {
            return true;
        } else {
            const currentDateTime = new Date();
            const futureDateTime = new Date(currentDateTime);
            futureDateTime.setHours(futureDateTime.getHours() + 5)
            return new Date(ride.start_time) < futureDateTime
        }
    }

    const renderRides = useCallback(() => {
        const renderFooter = (ride) => {
            return (
                <div className="card-footer">
                    <div className="card-driver-info">
                        <span>Driver: {ride.driver_name}</span>
                        <span>vehicle: {ride.vehicle_id.make} {ride.vehicle_id.model}</span>
                    </div>
                    <Button
                        label="Cancel"
                        onClick={() => {
                            setActionPerformed("cancelRide");
                            setVisible(true);
                            setCurrentRide(ride);
                        }}
                        disabled={getCancelRideDiable(ride)}

                    />
                </div>
            );
        };
        if (listOfRides.length === 0) {
            return <div className="t18-sb">There are no rides here</div>
        }
        if (filteredData.length === 0) {
            return <div className="t18-sb">No search result found</div>
        }
        return filteredData.map((ride) => {
            return <RideCard key={ride.id} ride={ride} footer={renderFooter(ride)} />;
        });
    }, [filteredData, listOfRides]);

    useEffect(() => {
        fetchRides(statusMapping[activeIndex]);
    }, [fetchRides, activeIndex, statusMapping]);
    const onCancelDialog = () => {
        setVisible(false);
        setActionPerformed("");
    };

    const DialogFooter = () => {
        return (
            <div className="scheduled-rides-dialog-footer">
                <Button label="Cancel" text onClick={onCancelDialog} />
                <Button
                    label={actionDetails[actionPerformed].buttonLabel}
                    disabled={!actionDetails[actionPerformed]?.disabled()}
                    onClick={actionDetails[actionPerformed]?.submit}
                />
            </div>
        );
    };

    const actionDetails = {
        cancelRide: {
            header: () => (
                <>
                    {currentRide.pickup_location.coordinates.location} <i className="pi pi-arrow-right" />{" "}
                    {currentRide.drop_location.coordinates.location}
                </>
            ),
            content: () =>
                isLoading.cancelRide ? (
                    <Spinner />
                ) : (
                    <span className="t14"> Are you sure you want to cancel this ride?</span>
                ),
            footer: DialogFooter,
            submit: cancelRide,
            disabled: () => { return true },
            buttonLabel: "Cancel Ride"
        }
    }
    return (
        <div className="bookings-page">
            <div>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText
                        placeholder="Search bookings..."
                        className="bookings-search"
                        value={searchString}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </IconField>
            </div>
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Upcoming">
                    {isLoading.fetchRides ? <Spinner /> :
                        (<div className="rides-container">{renderRides()}</div>)
                    }
                </TabPanel>
                <TabPanel header="Completed">
                    {isLoading.fetchRides ? <Spinner /> :
                        (<div className="rides-container">{renderRides()}</div>)
                    }
                </TabPanel>
                <TabPanel header="Cancelled">
                    {isLoading.fetchRides ? <Spinner /> :
                        (<div className="rides-container">{renderRides()}</div>)
                    }
                </TabPanel>
            </TabView>
            <CustomDialog
                header={actionDetails[actionPerformed]?.header}
                visible={visible}
                onHide={onCancelDialog}
                className={actionDetails[actionPerformed]?.className}
                footer={actionDetails[actionPerformed]?.footer}
            >
                <div>{actionDetails[actionPerformed]?.content()}</div>
            </CustomDialog>
        </div>
    );
};