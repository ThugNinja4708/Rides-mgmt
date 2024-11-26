import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { TabView, TabPanel } from "primereact/tabview";
import "./BookingsPage.css";
import { RideCard } from "common-components/RideCard/RideCard";
import { useCallback, useEffect, useState } from "react";
import { axios } from "lib/axios";
import { Button } from "primereact/button";
export const BookingsPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState({ lat: 17.432774288239816, lng: 78.37526020944561 });
    const [listOfRides, setListOfRides] = useState([]);
    const [error, setError] = useState(null);
    const getUsersCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position?.coords.latitude,
                        longitude: position?.coords.longitude
                    });
                },
                (err) => {
                    alert(err.message);
                }
            );
        });
    };
    const fetchRides = useCallback(async () => {
        setIsLoading(true);
        // await getUsersCurrentLocation()
        const response = await axios.post("/rider/get_all_rides", {
            current_location: [location.lat, location.lng]
        });
        setListOfRides(response.data.data);
    }, [location.lat, location.lng]);
    const renderRides = useCallback(() => {
        const renderFooter = (ride)=>{
            return (
                <div className="card-footer">
                    <div className="card-driver-info">
                        <span>Driver: {ride.driver_id}</span> <span>Vehicle: {ride.vehicle_id}</span>
                    </div>
                    <div>
                        <Button label="View details" text />
                    </div>
                </div>
            )
        }
        return listOfRides.map((ride) => <RideCard key={ride.id} ride={ride} footer={renderFooter(ride)} />);
    }, [listOfRides]);
    useEffect(() => {
        fetchRides();
    }, [fetchRides]);
    return (
        <div className="bookings-page">
            <div>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText placeholder="Search bookings..." className="bookings-search" />
                </IconField>
            </div>
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Upcoming">
                    <div className="rides-container">{renderRides()}</div>
                </TabPanel>
                <TabPanel header="Completed">
                    <p className="">Completed</p>
                </TabPanel>
                <TabPanel header="Cancelled">
                    <p className="">Cancelled</p>
                </TabPanel>
            </TabView>
        </div>
    );
};
