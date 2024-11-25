import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import "./BookingsPage.css";
import { RideCard } from "common-components/RideCard/RideCard";
import { useCallback, useEffect, useState } from "react";
import {axios} from "lib/axios"
export const BookingsPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState({lat: 17.432774288239816, lng: 78.37526020944561})
    const [listOfRides, setListOfRides] = useState([])
    const [error, setError] = useState(null)
    const getUsersCurrentLocation = ()=>{
        return new Promise((resolve, reject)=>{navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position?.coords.latitude,
                longitude: position?.coords.longitude,
              });
            },
            (err) =>{
                alert(err.message)
            }
        )
    })
    }
    const fetchRides = async ()=>{
        setIsLoading(true);
        // await getUsersCurrentLocation()
        const response = await axios.post("/rider/get_all_rides", {
            current_location: [location.lat, location.lng]
        })
        setListOfRides(response.data.data)

    }
    const renderRides = useCallback(()=>{
        return listOfRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
        ));
    }, [listOfRides])
    useEffect(() => {
        fetchRides()
    }, []);
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
                    <div className="rides-container">
                    {renderRides()}
                    </div>
                </TabPanel>
                <TabPanel header="Completed">
                    <p className="">
                        Completed
                    </p>
                </TabPanel>
                <TabPanel header="Cancelled">
                    <p className="">
                        Cancelled
                    </p>
                </TabPanel>
            </TabView>
        </div>
    );
};
