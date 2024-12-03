import "./RideCard.css";
import { Card } from "primereact/card";
import { Tag } from "common-components/Tag/Tag";
import { DateComponent } from "common-components/DateComponent/DateComponent";
export const RideCard = ({ ride, footer }) => {
    const getSeverity = ()=>{
        if(ride.status === "cancelled"){
            return "failure"
        }
        if(ride.status === "scheduled"){
            return "success"
        }
    }
    const date = new Date(ride.start_time);
    const formattedDate = date.toISOString().split("T")[0];
    const time = `${date.getHours()}:${date.getMinutes()}`
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
                        <div className="card-date-time-availability">
                            <DateComponent date={formattedDate} time={time}/>
                        <div>
                            <span>Available Seats: {ride.available_seats}</span>
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
