import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import "./ScheduledRides.css";
import { axios } from "lib/axios";
import { RideCard } from "common-components/RideCard/RideCard";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { HttpStatusCode } from "axios";
import { BookingsTable } from "common-components/BookingsTable/BookingsTable";
import { getUsersCurrentLocation, searchRidesByInput } from "lib/utils";
import Spinner from "common-components/Spinner/Spinner";
import useError from "hooks/useError";
import {  useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import useAuth from "hooks/useAuth";

export const ScheduledRides = () => {
    const [scheduledRides, setScheduledRides] = useState([]);
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [places, setPlaces] = useState([]);
    const [capacityOptions, setCapacityOptions] = useState([]);
    const [currentRide, setCurrentRide] = useState();
    const [searchString, setSearchString] = useState();
    const [filteredData, setFilteredData] = useState();
    const [inputs, setInputs] = useState({
        start_time: "",
        price_per_seat: "",
        capacity: "",
        pickup_location: "",
        drop_location: "",
        vehicle_id: ""
    });
    const { setErrorRef } = useError();
    const [isLoading, setIsLoading] = useState({
        createRide: false,
        cancelRide: false,
        getVehicles: false,
        getPlaces: false,
        getAllScheduledRides: false
    });
    let minDate = new Date();
    const pickupRef = useRef(null);
    const dropRef = useRef(null);
    const { user } = useAuth();
    const libraries = ["places"];
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: "AIzaSyDJ6xZxVNPiNVWIGsE82M1tOGeqHfGX7dI",
        libraries: libraries
    });

    const handleOnPlacesChanged = (type) => {
        const ref = type === "pickup" ? pickupRef : dropRef;
        const place = ref.current.getPlaces?.()[0];
        if (place) {
            const location = {
                name: place.formatted_address || place.name,
                coordinates: {
                    lat: place.geometry.location.lng(),
                    lng: place.geometry.location.lat()
                }
            };
            setInputs((prev) => ({
                ...prev,
                [type === "pickup" ? "pickup_location" : "drop_location"]: location
            }));
        }
        
    };
    const getCancelRideDiable=(ride)=>{
        if(!(ride.status !== "cancelled")){
            return true;
        }else{
            const currentDateTime = new Date();
            const futureDateTime = new Date(currentDateTime);
            futureDateTime.setHours(futureDateTime.getHours() + 5)
            return new Date(ride.start_time) < futureDateTime
        }

    }

    const cardFooter = (ride) => (
        <div style={{ display: "flex", gap: "10px" }}>
            <Button
                label="View Bookings"
                text
                onClick={() => {
                    setVisible(true);
                    setActionPerformed("showBookings");
                    setCurrentRide(ride);
                }}
            />
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
        // to be implemented
    );
    

    const getAllScheduledRides = async () => {
        try {
            setIsLoading((prev) => ({ ...prev, getAllScheduledRides: true }));
            const response = await axios.get("/driver/get_all_rides");
            setScheduledRides(response.data.data);
            setFilteredData(response.data.data);
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, getAllScheduledRides: false }));
        }
    };

    useEffect(() => {
        getAllScheduledRides();
    }, []);

    const renderBookingsTable = () => {
        return <BookingsTable ride={currentRide} />;
    };

    const createRideContent = () => {
        return isLoading.createRide || isLoading.getPlaces || isLoading.getVehicles ? (
            <Spinner />
        ) : (
            <div className="scheduled-rides-create-ride-container">
                <StandaloneSearchBox
                    onLoad={(ref) => (pickupRef.current = ref)}
                    onPlacesChanged={() => handleOnPlacesChanged("pickup")}
                >
                    <InputText
                        type="text"
                        placeholder="Pickup Location"
                        className="input-fields"
                        value={inputs.pickup_location?.name || ""}
                        onChange={(e) =>
                            setInputs((prev) => ({
                                ...prev,
                                pickup_location: { ...prev.pickup_location, name: e.target.value }
                            }))
                        }
                    />
                </StandaloneSearchBox>

                <StandaloneSearchBox
                    onLoad={(ref) => (dropRef.current = ref)}
                    onPlacesChanged={() => handleOnPlacesChanged("drop")}
                >
                    <InputText
                        type="text"
                        placeholder="Drop Location"
                        className="input-fields"
                        value={inputs.drop_location?.name || ""}
                        onChange={(e) =>
                            setInputs((prev) => ({
                                ...prev,
                                drop_location: { ...prev.drop_location, name: e.target.value }
                            }))
                        }
                    />
                </StandaloneSearchBox>

                <Dropdown
                    value={inputs.vehicle_id}
                    onChange={(e) => setInputs((prev) => ({ ...prev, vehicle_id: e.value }))}
                    options={vehicles}
                    placeholder="Select Vehicle"
                    className="input-fields"
                    filter
                />
                <Dropdown
                    value={inputs.capacity}
                    onChange={(e) => setInputs((prev) => ({ ...prev, capacity: e.value }))}
                    options={capacityOptions}
                    placeholder="Select Availability"
                    className="input-fields"
                    disabled={!inputs.vehicle_id}
                />
                <Calendar
                    value={inputs.start_time}
                    onChange={(e) => setInputs((prev) => ({ ...prev, start_time: e.value }))}
                    showTime
                    hourFormat="12"
                    className="input-fields"
                    placeholder="Select Start Date Time"
                    showIcon={true}
                    minDate={minDate}
                />
                <InputNumber
                    inputId="currency-us"
                    value={inputs.price_per_seat}
                    onChange={(e) => setInputs((prev) => ({ ...prev, price_per_seat: e.value }))}
                    mode="currency"
                    currency="USD"
                    placeholder="Price Per Seat"
                    className="input-fields"
                />
            </div>
        ); // validations to be implemented
    };

    const inputsFilled = () => {
        return Object.values(inputs).every((value) => !!value && value !== "");
    };

    const DialogFooter = () => {
        return (
            <div className="scheduled-rides-dialog-footer">
                <Button label="Cancel" text onClick={onCancelDialog} />
                <Button
                    label={actions[actionPerformed].buttonLabel}
                    disabled={!actions[actionPerformed]?.disabled()}
                    onClick={actions[actionPerformed]?.submit}
                />
            </div>
        );
    };

    const getVehicles = async () => {
        try {
            setIsLoading((prev) => ({ ...prev, getVehicles: true }));
            const response = await axios.get("/driver/get_vehicles_list");
            const vehiclesList = response.data.data.map((vehicle) => ({
                label: `${vehicle.make} ${vehicle.model}`,
                value: vehicle
            }));
            setVehicles(vehiclesList);
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, getVehicles: false }));
        }
    };

    const getPlaces = () => {
        try {
            setIsLoading((prev) => ({ ...prev, getPlaces: true }));
            getUsersCurrentLocation()
                .then(async (location) => {
                    const response = await axios.post("/coordinates/get_places", {
                        lat: location.lat,
                        lng: location.lng
                    });
                    const placesList = Object.entries(response.data.data).map(([label, value]) => ({
                        label,
                        value: {
                            name: label,
                            coordinates: value
                        }
                    }));
                    setPlaces(placesList);
                })
                .catch((error) => {
                    setErrorRef.current(error);
                });
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, getPlaces: false }));
        }
    };

    useEffect(() => {
        if (actionPerformed === "createRide") {
            getVehicles();
        }
    }, [actionPerformed]);

    useEffect(() => {
        if (inputs.vehicle_id) {
            const options = Array.from({ length: inputs.vehicle_id?.capacity }, (_, index) => ({
                label: (index + 1).toString(),
                value: index + 1
            }));
            setCapacityOptions(options);
        } else {
            setCapacityOptions([]);
        }
    }, [inputs.vehicle_id]);

    const onCancelDialog = () => {
        setVisible(false);
        setActionPerformed("");
        setInputs({
            start_time: "",
            price_per_seat: "",
            capacity: "",
            pickup_location: "",
            drop_location: "",
            vehicle_id: ""
        });
    };

    const createRide = async () => {
        const start_time = inputs.start_time.toISOString().split(".")[0] + "Z";
        try {
            setIsLoading((prev) => ({ ...prev, createRide: true }));
            const response = await axios.post("/driver/create_ride", {
                pickup_location: {
                    name: inputs.pickup_location.name,
                    coordinates: inputs.pickup_location.coordinates
                },
                drop_location: {
                    name: inputs.drop_location.name,
                    coordinates: inputs.drop_location.coordinates
                },
                vehicle_id: inputs.vehicle_id,
                capacity: inputs.capacity,
                price_per_seat: inputs.price_per_seat,
                start_time: start_time
            });
            if (response.data.status === HttpStatusCode.Ok) {
                getAllScheduledRides();
            }
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, createRide: false }));
            onCancelDialog();
        }
    };

    const cancelRide = async () => {
        try {
            setIsLoading((prev) => ({ ...prev, cancelRide: true }));
            const response = await axios.post("/driver/cancel_ride", {
                ride_id: currentRide._id
            });
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, cancelRide: false }));
            onCancelDialog();
            getAllScheduledRides();
        }
    };

    const handleSearch = (e) => {
        setSearchString(e.target.value);
        setFilteredData(searchRidesByInput(e.target.value, scheduledRides));
    };

    const actions = {
        createRide: {
            label: "Create Ride",
            buttonLabel: "Create Ride",
            content: createRideContent,
            footer: DialogFooter,
            disabled: inputsFilled,
            header: () => "Create Ride",
            submit: createRide,
            className: "dialog-sm"
        },
        showBookings: {
            header: () => (
                <>
                    Bookings for {currentRide.pickup_location.coordinates.location} <i className="pi pi-arrow-right" />{" "}
                    {currentRide.drop_location.coordinates.location}
                </>
            ),
            label: "Bookings for this ride",
            content: renderBookingsTable,
            footer: () => {
                <>footer</>;
            },
            className: "dialog-xl"
        },
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
            disabled: () => {return true},
            buttonLabel: "Cancel Ride"
        }
    };

    return (
        <div className="scheduled-rides">
            <div className="scheduled-rides-toolbar">
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
                </div>
                <Button
                    label="Create Ride"
                    className="create-ride-btn"
                    onClick={() => {
                        setVisible(true);
                        setActionPerformed("createRide");
                    }}
                    disabled={user.status === "pending"}
                />
            </div>
            {isLoading.getAllScheduledRides ? (
                <Spinner />
            ) : (
                <div className="rides-container">
                    {filteredData?.map((ride) => (
                        <RideCard key={ride.id} ride={ride} footer={() => cardFooter(ride)} />
                    ))}
                </div>
            )}
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
};
