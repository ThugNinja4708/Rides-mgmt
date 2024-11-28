import "./RideCard.css";
import { Card } from "primereact/card";
import { Tag } from "common-components/Tag/Tag";

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
    const time = `${date.getHours()}: ${date.getHours()}`
    const pickup_location = ride.pickup_location.coordinates.location
    const drop_location = ride.drop_location.coordinates.location

    return (
        <div>
            <Card footer={footer} className="card-container t14">
                <div className="card-content">
                    <div className="card-content-left">
                        <div className="card-location-content">
                            <i className="pi pi-map-marker" style={{"color": "rgb(59 130 246)"}}/>
                            <div className="card-location t14-sb">
                            <span>From: {pickup_location}</span>
                            <span>To: {drop_location}</span>
                            </div>
                        </div>
                        <div className="card-date-time t14-sb">
                            <span ><i className="pi pi-calendar"/> {formattedDate}</span>
                            <span><i className="pi pi-clock"/> {time}</span>
                        </div>
                        <div className="t14-sb"><span>Avilable seats: {ride.capacity}</span></div>
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
