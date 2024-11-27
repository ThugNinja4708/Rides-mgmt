import { axios } from "lib/axios";
export const bookRideApi = async(ride_id, paymentInfo)=>{
    const response = await axios.post("/api/rider/book_ride", {
        ride_id: ride_id,
        payment_info: paymentInfo
    })
    return response.data;
}