import "./RideCard.css";
import { Card } from "primereact/card";
import { Tag } from "common-components/Tag/Tag";
import { Button } from "primereact/button";
export const RideCard = ({ ride, footer }) => {
    const getSeverity = ()=>{
        if(ride.status == "cancelled"){
            return "failure"
        }
        if(ride.status == "scheduled"){
            return "success"
        }
    }
    const date = new Date(ride.start_time);
    const formattedDate = date.toISOString().split("T")[0];
    const time = `${date.getHours()}:${date.getHours()}`
    const pickup_location = ride.pickup_location.coordinates.location
    const drop_location = ride.drop_location.coordinates.location
    const vehicle = `${ride.vehicle_id.make} ${ride.vehicle_id.model}`
    const renderFooter = (
        <div className="card-footer">
            <div className="card-driver-info">
                <span>Driver: {ride.driver_id}</span> <span>Vehicle: {vehicle}</span>
            </div>
            {footer}
        </div>
    );
    return (
        <div>
            <Card footer={renderFooter} className="card-container t14">
                <div className="card-content">
                    <div className="card-content-left">
                        <div className="card-location-content">
                            <i className="pi pi-map-marker" style={{"color": "rgb(59 130 246)"}}/>
                            <div className="card-location t14-sb">
                            <span>From: {pickup_location}</span>
                            <span>To: {drop_location}</span>
                            </div>
                        </div>
                        <div className="card-date-time-availability">
                        <div className="card-date-time t14-sb">
                            <span ><i className="pi pi-calendar"/> {formattedDate}</span>
                            <span><i className="pi pi-clock"/> {time}</span>
                        </div>
                        <div>
                            <span>Available Seats: {ride.capacity}</span>
                        </div>
                        </div>

                    </div>
                    <div className="card-content-right">
                        <span className="t14-sb">${ride.price_per_seat}</span>
                        <Tag value={ride.status} severity={getSeverity()}></Tag>
                    </div>
                </div>
            </Card>
        </div>
    );
};
