import useAuth from "hooks/useAuth"
import { RiderHome } from "./RiderHome";
import { ScheduledRides } from "pages/ScheduledRides/ScheduledRides";
import { AdminHome } from "./AdminHome";

export const Home = ()=>{
    const {user}  = useAuth();
    if (user?.role === "rider"){
        return <RiderHome/>
    }
    if(user?.role === "driver"){
        return <ScheduledRides/>
    }
    if(user?.role === "admin"){
        return <AdminHome/>
    }
}