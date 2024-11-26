import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { RideCard } from "common-components/RideCard/RideCard";
import { useCallback, useEffect, useState } from "react";
import { axios } from "lib/axios";
import { validateCreditCard, validateCVV, validateExpiryDate } from "lib/utils";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import "./Home.css";
export const Home = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState({ lat: 17.432774288239816, lng: 78.37526020944561 });
    const [listOfRides, setListOfRides] = useState([]);
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState();
    const [userInputs, setUserInputs] = useState({ expiryDate: "", displayNumber: "", cardHolderName: "", cvv: "" });
    const [isValid, setIsValid] = useState({ cardNumber: true, expiryDate: true, cvv: true });
    const getUsersCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position?.coords.latitude,
                        longitude: position?.coords.longitude
                    });
                },
                (err) => {
                    console.log(err.message);
                }
            );
        });
    };
    const renderCreditCardPayment = () => {
        const isFormValid = isValid.cardNumber && isValid.expiryDate && isValid.cvv;
        const handleCardNumberChange = (e) => {
            const formattedNumber = e.target.value.replace(/\D/g, "").slice(0, 16);
            const displayNumber = formattedNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
            setUserInputs((prev) => ({ ...prev, cardNumber: displayNumber }));
            setIsValid((prev) => ({ ...prev, cardNumber: validateCreditCard(formattedNumber) }));
        };
        const handleExpiryChange = (e) => {
            let value = e.target.value.replace(/\D/g, "").slice(0, 4);
            if (value.length >= 3) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
            }
            setUserInputs((prev) => ({ ...prev, expiryDate: value }));
            setIsValid((prev) => ({ ...prev, expiryDate: validateExpiryDate(value) }));
        };
        const handleCVVChange = (e) => {
            const formattedCVV = e.target.value.replace(/\D/g, "").slice(0, 4);
            setUserInputs((prev) => ({ ...prev, cvv: formattedCVV }));
            setIsValid((prev) => ({ ...prev, cvv: validateCVV(formattedCVV) }));
        };
        return (
            <div className="credit-card-container">
                <div className="credit-card-input ">
                    <label htmlFor="card-number" className="t14-sb">
                        Card Number
                    </label>
                    <InputText
                        value={userInputs.cardNumber}
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        onChange={handleCardNumberChange}
                        invalid = {!isValid.cardNumber}
                    />
                </div>
                <div className="credit-card-input ">
                    <label htmlFor="card-holder-name" className="t14-sb">
                        Cardholder Name
                    </label>
                    <InputText
                        value={userInputs.cardHolderName}
                        id="card-holder-name"
                        placeholder="Adam smith"
                        type="text"
                        onChange={(e) => {
                            setUserInputs((prev) => ({ ...prev, cardHolderName: e.target.value }));
                        }}
                    />
                </div>
                <div className="credit-card-input">
                    <label htmlFor="expiry-date" className="t14-sb">
                        Expiry Date
                    </label>
                    <InputText
                        value={userInputs?.expiryDate}
                        id="expiry-date"
                        placeholder="MM/YY"
                        onChange={handleExpiryChange}
                        invalid={!isValid.expiryDate}
                    />
                </div>
                <div className="credit-card-input">
                    <label htmlFor="expiry-date" className="t14-sb">
                        CVV
                    </label>
                    <InputText
                        value={userInputs?.cvv}
                        id="cvv"
                        placeholder="334"
                        onChange={handleCVVChange}
                        keyfilter="int"
                        invalid={!isValid.cvv}
                    />
                </div>
                <Button label="Pay Now" disabled={actionDetails[actionPerformed]?.disabled}/>
            </div>
        );
    };
    const actionDetails = {
        bookRide: {
            content: renderCreditCardPayment,
            disabled: !(isValid.cardNumber && isValid.expiryDate && isValid.cvv),
        }
    };

    const renderRides = useCallback(() => {
        const renderFooter = (ride) => {
            return (
                <div className="card-footer">
                    <div className="card-driver-info">
                        <span>Driver: {ride.driver_id}</span> <span>Vehicle: {ride.vehicle_id}</span>
                    </div>
                    <div>
                        <Button
                            label="Book"
                            onClick={() => {
                                setActionPerformed("bookRide");
                                setVisible(true);
                            }}
                        />
                    </div>
                </div>
            );
        };
        return listOfRides.map((ride) => <RideCard key={ride.id} ride={ride} footer={renderFooter(ride)} />);
    }, [listOfRides]);

    const fetchRides = useCallback(async () => {
        setIsLoading(true);
        // await getUsersCurrentLocation()
        const response = await axios.post("/rider/get_all_rides", {
            current_location: [location.lat, location.lng]
        });
        setListOfRides(response.data.data);
    }, [location.lat, location.lng]);

    useEffect(() => {
        fetchRides();
    }, [fetchRides]);
    return (
        <div className="Home-container">
            <div>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText placeholder="Search rides..." className="bookings-search" />
                </IconField>
            </div>
            <div className="rides-container">{renderRides()}</div>

            <Dialog
                header={"Credit Card Payment"}
                visible={visible}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
                style={{ width: "50rem" }}
            >
                <div style={{ padding: "1rem" }}>{actionDetails[actionPerformed]?.content()}</div>
            </Dialog>
        </div>
    );
};
