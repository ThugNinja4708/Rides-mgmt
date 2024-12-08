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
export const History = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [listOfRides, setListOfRides] = useState([]);
    const [completedRides,setCompletedRides] = useState([]);
    const [searchString, setSearchString] = useState();
    const [filteredData, setFilteredData] = useState([]);
    const [filteredData1, setFilteredData1] = useState([]);
    const statusMapping = useMemo(()=>["scheduled", "completed", "completed"], []);
    const { setErrorRef } = useError();
    const fetchRides = useCallback(async (status) => {
        try{
        setIsLoading(true);
        const response = await axios.post("/rider/get_all_rides_by_status", {
            status,
        });
        setListOfRides(response.data.data);
        setCompletedRides(response.data.data);
        setFilteredData(response.data.data);
        setFilteredData1(response.data.data);
    }catch(error){
        setErrorRef.current(error);
    }
    finally{
        setIsLoading(false);
    }
    }, []);

    const handleSearch = useCallback((value) => {
        setSearchString(value);
        setFilteredData(searchRidesByInput(value, listOfRides))
    }, [listOfRides,activeIndex])

    const renderRides1 = useCallback(() => {
        const compRides = [
            {
                "_id": "67531d74c5c1a2e1aab7c32b",
                "driver_id": "67531c56c5c1a2e1aab7c328",
                "pickup_location": {
                    "type": "Point",
                    "coordinates": {
                        "type": "Point",
                        "coordinates": {
                            "lat": -94.39025199999999,
                            "lng": 38.9323652
                        },
                        "location": "1101 NW Innovation Parkway, 1101 NW Innovations Pkwy, Lee's Summit, MO 64086"
                    }
                },
                "drop_location": {
                    "type": "Point",
                    "coordinates": {
                        "type": "Point",
                        "coordinates": {
                            "lat": -94.6703359,
                            "lng": 38.8760706
                        },
                        "location": "7450 W 139th Terrace, Overland Park, KS 66223"
                    }
                },
                "list_of_riders": [
                    "67531c45c5c1a2e1aab7c327",
                    "67531cedc5c1a2e1aab7c329"
                ],
                "status": "completed",
                "price_per_seat": 10,
                "start_time": "2024-12-06T16:51:07",
                "available_seats": 1,
                "vehicle_id": {
                    "make": "Ford",
                    "model": "Focus",
                    "license_plate": "FORDFOCUS",
                    "capacity": 3
                },
                "created_at": "2024-12-03T15:51:16.392000",
                "updated_at": "2024-12-06T15:51:16.392000",
                "driver_name": "praveen"
            },
            {
                "_id": "67531d74c5c1a2e1aab7c32b",
                "driver_id": "67531c56c5c1a2e1aab7c328",
                "pickup_location": {
                    "type": "Point",
                    "coordinates": {
                        "type": "Point",
                        "coordinates": {
                            "lat": -94.39025199999999,
                            "lng": 38.9323652
                        },
                        "location": "1101 NW Innovation Parkway, 1101 NW Innovations Pkwy, Lee's Summit, MO 64086"
                    }
                },
                "drop_location": {
                    "type": "Point",
                    "coordinates": {
                        "type": "Point",
                        "coordinates": {
                            "lat": -94.6703359,
                            "lng": 38.8760706
                        },
                        "location": "Lakes at lionsgate, Overland Park, KS 66223"
                    }
                },
                "list_of_riders": [
                    "67531c45c5c1a2e1aab7c327",
                    "67531cedc5c1a2e1aab7c329"
                ],
                "status": "completed",
                "price_per_seat": 20,
                "start_time": "2024-12-06T16:51:07",
                "available_seats": 1,
                "vehicle_id": {
                    "make": "Ford",
                    "model": "Focus",
                    "license_plate": "FORDFOCUS",
                    "capacity": 3
                },
                "created_at": "2024-12-04T15:51:16.392000",
                "updated_at": "2024-12-06T15:51:16.392000",
                "driver_name": "praveen"
            }
        ]
        console.log("completed rides",completedRides);
        console.log("filtered data",filteredData1);
        
        
        const renderFooter = (ride) => {
            return (
                <div className="card-footer">
                    <div className="card-driver-info">
                        <span>Driver: {ride.driver_name}</span>
                        <span>vehicle: {ride.vehicle_id.make} {ride.vehicle_id.model}</span>
                    </div>
                </div>
            );
        };
        return compRides.map((ride) => {
            return <RideCard key={ride.id} ride={ride} footer={renderFooter(ride)} />;
        });
    }, [filteredData1, completedRides]);

    const renderRides = useCallback(() => {
        const renderFooter = (ride) => {
            return (
                <div className="card-footer">
                    <div className="card-driver-info">
                        <span>Driver: {ride.driver_name}</span>
                        <span>vehicle: {ride.vehicle_id.make} {ride.vehicle_id.model}</span>
                    </div>
                </div>
            );
        };
        if (listOfRides.length === 0) {
            return <div className="t18-sb">There are no rides here</div>
        }
        if(filteredData.length === 0){
            return <div className="t18-sb">No search result found</div>
        }
        return filteredData.map((ride) => {
            return <RideCard key={ride.id} ride={ride} footer={renderFooter(ride)} />;
        });
    }, [filteredData, listOfRides]);
    useEffect(() => {
        fetchRides(statusMapping[activeIndex]);
    }, [fetchRides, activeIndex, statusMapping]);
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
                    {isLoading ? <Spinner /> :
                        (<div className="rides-container">{renderRides()}</div>)
                    }
                </TabPanel>
                <TabPanel header="Completed">
                    {isLoading ? <Spinner /> :
                        (<div className="rides-container">{renderRides1()}</div>)
                    }
                </TabPanel>
                <TabPanel header="Cancelled">
                    {isLoading ? <Spinner /> :
                        (<div className="rides-container">{renderRides()}</div>)
                    }
                </TabPanel>
            </TabView>
        </div>
    );
};