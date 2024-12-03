import { axios } from "lib/axios";
export const bookRideApi = async(ride_id, paymentInfo, riderPickUpLocation)=>{
    const response = await axios.post("/rider/book_ride", {
        ride_id: ride_id,
        payment_info: paymentInfo,
        rider_pickup_location: riderPickUpLocation
    })
    return response.data;
}