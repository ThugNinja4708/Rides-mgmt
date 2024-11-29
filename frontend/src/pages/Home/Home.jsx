import useAuth from "hooks/useAuth"
import { RiderHome } from "./RiderHome";
import { ScheduledRides } from "pages/ScheduledRides/ScheduledRides";

export const Home = ()=>{
    const {user}  = useAuth();
    if (user.current.role === "rider"){
        return <RiderHome/>
    }
    if(user.current.role === "driver"){
        return <ScheduledRides/>
    }
}