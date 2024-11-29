import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import "./ScheduledRides.css";
import { axios } from "lib/axios";
import { RideCard } from "common-components/RideCard/RideCard";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { HttpStatusCode } from "axios";
export const ScheduledRides = () => {
    const [scheduledRides, setScheduledRides] = useState([]);
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(["17.434574146433405", "78.37473108060927"]); // right now fixed to Hyderabad
    const [places, setPlaces] = useState([]);
    const [capacityOptions, setCapacityOptions] = useState([]);
    const [inputs, setInputs] = useState({
        start_time: "",
        price_per_seat: "",
        capacity: "",
        pickup_location: "",
        drop_location: "",
        vehicle_id: ""
    });

    const cardFooter = (
        <div style={{ display: "flex" }}>
            <Button label="View Bookings" text /> 
            <Button label="Cancel" />
        </div>
        // to be implemented
    );

    const getAllScheduledRides = async () => {
        try {
            const response = await axios.get("/driver/get_all_rides");
            setScheduledRides(response.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllScheduledRides();
    }, []);

    const createRideContent = () => {
        return (
            <div className="scheduled-rides-create-ride-container">
                <Dropdown
                    value={inputs.pickup_location}
                    onChange={(e) => setInputs((prev) => ({ ...prev, pickup_location: e.value }))}
                    options={places}
                    placeholder="Select Pickup Location"
                    className="input-fields"
                    filter
                />
                <Dropdown
                    value={inputs.drop_location}
                    onChange={(e) => setInputs((prev) => ({ ...prev, drop_location: e.value }))}
                    options={places}
                    placeholder="Select Drop Location"
                    className="input-fields"
                    filter
                />
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
                    hourFormat="24"
                    className="input-fields"
                    placeholder="Select Start Date Time"
                />
                <InputNumber
                    inputId="currency-us"
                    value={inputs.price_per_seat}
                    onValueChange={(e) => setInputs((prev) => ({ ...prev, price_per_seat: e.value }))}
                    mode="currency"
                    currency="USD"
                    placeholder="Price Per Seat"
                    className="input-fields"
                />
            </div> // validations to be implemented
        );
    };

    const inputsFilled = () => {
        return Object.values(inputs).every((value) => !!value || value !== "");
    };

    const actions = {
        createRide: {
            label: "Create Ride",
            buttonLabel: "Create Ride",
            content: createRideContent,
            disabled: inputsFilled
        }
    };

    const DialogFooter = () => {
        return (
            <div className="scheduled-rides-dialog-footer">
                <Button label="Cancel" text onClick={onCancelDialog} />
                <Button label="Create Ride" disabled={!actions[actionPerformed]?.disabled()} onClick={createRide} />
            </div>
        );
    };

    const getVehicles = async () => {
        try {
            const response = await axios.get("/driver/get_vehicles_list");
            const vehiclesList = response.data.data.map((vehicle) => ({
                label: `${vehicle.make} ${vehicle.model}`,
                value: vehicle
            }));
            setVehicles(vehiclesList);
        } catch (error) {
            console.log(error);
        }
    };

    const getPlaces = async () => {
        try {
            const response = await axios.post("/coordinates/get_places", {
                lat: currentLocation[0],
                lng: currentLocation[1]
            });
            const placesList = Object.entries(response.data.data).map(([label, value]) => ({
                label,
                value: {
                    name: label,
                    coordinates: value
                }
            }));
            setPlaces(placesList);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (actionPerformed === "createRide") {
            getVehicles();
            getPlaces();
        }
    }, [actionPerformed]);

    useEffect(() => {
        if (inputs.vehicle_id) {
            {
                const options = Array.from({ length: inputs.vehicle_id?.capacity }, (_, index) => ({
                    label: (index + 1).toString(),
                    value: index + 1
                }));
                setCapacityOptions(options);
            }
        } else {
            setCapacityOptions([]);
        }
    }, [inputs.vehicle_id]);

    const onCancelDialog = () => {
        setVisible(false);
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
            if(response.data.status === HttpStatusCode.Ok){
                getAllScheduledRides();
            } // this is not tested verify this
        } catch (error) {
            console.log(error);
        } finally {
            onCancelDialog();
        }
    };

    return (
        <div className="scheduled-rides">
            <div className="scheduled-rides-toolbar">
                <div className="scheduled-rides-search-container">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search"> </InputIcon>
                        <InputText placeholder="Search bookings..." className="scheduled-rides-search" />
                    </IconField>
                </div>
                <Button
                    label="Create Ride"
                    className="create-ride-btn"
                    onClick={() => {
                        setVisible(true);
                        setActionPerformed("createRide");
                    }}
                />
            </div>
            {console.log(inputs.pickup_location)}
            <div className="scheduled-rides-cards">
                {scheduledRides.map((ride) => (
                    <RideCard key={ride.id} ride={ride} footer={cardFooter} />
                ))}
            </div>
            <Dialog
                header="Create Ride"
                visible={visible}
                onHide={onCancelDialog}
                footer={<DialogFooter />}
            >
                {actions[actionPerformed]?.content()}
            </Dialog>
        </div>
    );
};
