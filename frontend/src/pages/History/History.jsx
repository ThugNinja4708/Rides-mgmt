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
export const History = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [listOfRides, setListOfRides] = useState([]);
    const [searchString, setSearchString] = useState();
    const [filteredData, setFilteredData] = useState([]);
    const statusMapping = useMemo(()=>["scheduled", "completed", "completed"], []);
    const fetchRides = useCallback(async (status) => {
        try{
        setIsLoading(true);
        const response = await axios.post("/rider/get_all_rides_by_status", {
            status,
        });
        setListOfRides(response.data.data);
        setFilteredData(response.data.data);
    }catch(error){
        console.log(error);
    }
    finally{
        setIsLoading(false);
    }
    }, []);

    const handleSearch = useCallback((e) => {
        setSearchString(e.target.value);
        setFilteredData(searchRidesByInput(e.target.value, listOfRides))
    }, [listOfRides])

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
            return <div className="t18-sb">There are no ride here</div>
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
                        onChange={handleSearch}
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
                        (<div className="rides-container">{renderRides()}</div>)
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