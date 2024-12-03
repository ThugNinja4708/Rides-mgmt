import useAuth from "hooks/useAuth"
import { RiderHome } from "./RiderHome";
import { ScheduledRides } from "pages/ScheduledRides/ScheduledRides";

export const Home = ()=>{
    const {user}  = useAuth();
    if (user?.role === "rider"){
        return <RiderHome/>
    }
    if(user?.role === "driver"){
        return <ScheduledRides/>
    }
}