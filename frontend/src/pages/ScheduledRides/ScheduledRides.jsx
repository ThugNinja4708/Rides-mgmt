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
import { BookingsTable } from "common-components/BookingsTable/BookingsTable";
import {getUsersCurrentLocation, searchRidesByInput} from "lib/utils"

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
    const [isLoading, setIsLoading] = useState(false);
    const [inputs, setInputs] = useState({
        start_time: "",
        price_per_seat: "",
        capacity: "",
        pickup_location: "",
        drop_location: "",
        vehicle_id: ""
    });
    const [currentDate, setCurrentDate] = useState("");

    const cardFooter = (ride) => (
        <div style={{ display: "flex", gap: "10px" }}>
            <Button label="View Bookings" text onClick={()=>{
                setVisible(true);
                setActionPerformed("showBookings");
                setCurrentRide(ride);
            }}/>
            <Button label="Cancel"
            onClick={()=>{
                setActionPerformed("cancelRide");
                setVisible(true);
                setCurrentRide(ride);
            }}
            disabled={!(ride.status!=="cancelled")}
            />
        </div>
        // to be implemented
    );

    const getAllScheduledRides = async () => {
        try {
            const response = await axios.get("/driver/get_all_rides");
            setScheduledRides(response.data.data);
            setFilteredData(response.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllScheduledRides();
    }, []);

    const renderBookingsTable = ()=>{
        return(
            <BookingsTable ride={currentRide}/>
        )
    }

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

    const DialogFooter = () => {
        return (
            <div className="scheduled-rides-dialog-footer">
                <Button label="Cancel" text onClick={onCancelDialog} />
                <Button label={actions[actionPerformed].buttonLabel} disabled={!actions[actionPerformed]?.disabled()} onClick={actions[actionPerformed]?.submit} />
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

    const getPlaces = () => {
        try {
            getUsersCurrentLocation().then(async (location)=>{
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
            .catch((error)=>{console.log(error)})
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

    const cancelRide = async ()=>{
        try{
            setIsLoading(true);
            const response = await axios.post("/driver/cancel_ride", {
                ride_id: currentRide._id
            })
        }catch(error){
            console.log(error);
        }finally{
            setIsLoading(false);
            onCancelDialog();
            getAllScheduledRides();
        }
    }

    const handleSearch = (e)=>{
        setSearchString(e.target.value);
        setFilteredData(searchRidesByInput(e.target.value, scheduledRides))
    }

    const actions = {
        createRide: {
            label: "Create Ride",
            buttonLabel: "Create Ride",
            content: createRideContent,
            footer: DialogFooter,
            disabled: inputsFilled,
            header: ()=>{"Create Ride"},
            submit: createRide
        },
        showBookings: {
            header: ()=><>Bookings for {currentRide.pickup_location.coordinates.location} <i className="pi pi-arrow-right"/> {currentRide.drop_location.coordinates.location}</>,
            label: "Bookings for this ride",
            content: renderBookingsTable,
            footer: ()=>{<>footer</>},
            style: {width: "52rem"}
        },
        cancelRide: {
            header: ()=><>{currentRide.pickup_location.coordinates.location} <i className="pi pi-arrow-right"/> {currentRide.drop_location.coordinates.location}</>,
            content: ()=><span className="t14"> Are you sure you want to cancel this ride?</span>,
            footer: DialogFooter,
            submit: cancelRide,
            disabled: ()=>{return true},
            buttonLabel: "Cancel Ride"

        }
    };

    return (
        <div className="scheduled-rides">
            <div className="scheduled-rides-toolbar">
                <div className="search-container">
                    <IconField iconPosition="left" className="search-field">
                        <InputIcon className="pi pi-search"> </InputIcon>
                        <InputText value={searchString} placeholder="Search bookings..." className="rides-search" onChange={handleSearch}/>
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
            <div className="rides-container">
                {filteredData?.map((ride) => (
                    <RideCard key={ride.id} ride={ride} footer={()=>cardFooter(ride)} />
                ))}
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
