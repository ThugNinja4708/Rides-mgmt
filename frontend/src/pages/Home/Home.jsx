import useAuth from "hooks/useAuth"
import { RiderHome } from "./RiderHome";
export const Home = ()=>{
    const {user}  = useAuth();
    if (user.current.role === "rider"){
        return <RiderHome/>
    }
    if(user.current.role === "driver"){
        return <>Driver Home</>
    }
}