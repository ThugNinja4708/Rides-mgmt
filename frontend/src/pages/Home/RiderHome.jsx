import React, { useCallback, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { RideCard } from "common-components/RideCard/RideCard";
import { axios } from "lib/axios";
import { validateCreditCard, validateCVV, validateExpiryDate, getUsersCurrentLocation, searchRidesByInput } from "lib/utils";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import "./RiderHome.css";
import paymentImage from "images/payment complete animation.gif";
import { bookRideApi } from "./RiderHomeAPI.js";

export const RiderHome = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [listOfRides, setListOfRides] = useState([]);
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState();
    const [userInputs, setUserInputs] = useState({ cardNumber: "", expiryDate: "", cardHolderName: "", cvv: null });
    const [isValid, setIsValid] = useState({ cardNumber: false, expiryDate: false, cvv: false, cardHolderName: false });
    const [paymentStatus, setPaymentStatus] = useState("");
    const [currentRide, setCurrentRide] = useState(null);
    const [searchString, setSearchString] = useState();
    const [filteredData, setFilteredData] = useState([]);

    const [isTouched, setIsTouched] = useState({
        cardNumber: false,
        expiryDate: false,
        cvv: false,
        cardHolderName: false
    });


    const markFieldAsTouched = useCallback((field) => {
        setIsTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const handleCardNumberChange = useCallback((e) => {
        const formattedNumber = e.target.value.replace(/\D/g, "").slice(0, 16);
        const displayNumber = formattedNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
        setUserInputs((prev) => ({ ...prev, cardNumber: displayNumber }));
        if (displayNumber !== "") {
            setIsValid((prev) => ({ ...prev, cardNumber: validateCreditCard(formattedNumber) }));
        }
    }, []);

    const handleCardHolderNameChange = useCallback((value) => {
        setUserInputs((prev) => ({ ...prev, cardHolderName: value }));
        if (value !== "") setIsValid((prev) => ({ ...prev, cardHolderName: /^[A-Za-z\s]+$/.test(value) }));
        else {
            setIsValid((prev) => ({ ...prev, cardHolderName: false }));
        }
    }, []);

    const handleExpiryChange = useCallback((e) => {
        let value = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setUserInputs((prev) => ({ ...prev, expiryDate: value }));
        if (value !== "") {
            setIsValid((prev) => ({ ...prev, expiryDate: validateExpiryDate(value) }));
        }
    }, []);

    const handleCVVChange = useCallback((e) => {
        const formattedCVV = e.target.value.replace(/\D/g, "").slice(0, 4);
        setUserInputs((prev) => ({ ...prev, cvv: formattedCVV }));
        if (formattedCVV !== "") setIsValid((prev) => ({ ...prev, cvv: validateCVV(formattedCVV) }));
    }, []);

    const closeDialog = useCallback(() => {
        setVisible(false);
        setUserInputs((prev) => ({ ...prev, cardNumber: "", expiryDate: "", cardHolderName: "", cvv: "" }));
        setPaymentStatus(false);
        setIsValid((prev) => ({ ...prev, cardNumber: false, expiryDate: false, cvv: false }));
        setIsTouched((prev) => ({ ...prev, cardNumber: false, expiryDate: false, cvv: false }));
    }, []);

    const fetchRides = useCallback(() => {
        setIsLoading(true);
        getUsersCurrentLocation().then(async (location)=>{
            const response = await axios.post("/rider/get_all_available_rides", {
                current_location: [location.lng, location.lat]
            });
            setListOfRides(response.data.data);
            setFilteredData(response.data.data);
            setIsLoading(false);
        }).catch((error)=>{console.log(error)})
    }, []);

    const handlePayNow = useCallback(async () => {
        // Simulate payment processing
        const paymentInfo = {
            payment_method: "CARD",
            payment_status: "success"
        };
        const response = await bookRideApi(currentRide._id, paymentInfo);
        console.log(response)
        setPaymentStatus(true);
        setTimeout(() => {
            closeDialog();
            fetchRides();
        }, 3500);
    }, [currentRide, closeDialog, fetchRides]);

    const renderCreditCardPayment = useCallback(() => {
        const isFormValid = isValid.cardNumber && isValid.expiryDate && isValid.cvv && isValid.cardHolderName;
        return paymentStatus ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={paymentImage} width={300} height={300} alt="success" />
            </div>
        ) : (
            <div className="credit-card-container">
                <span className="t14-sb " style={{display:"flex", justifyContent:"center"}}> Make Payment for ${currentRide.price_per_seat}</span>
                <div className="credit-card-input">
                    <label htmlFor="card-number" className="t14-sb">
                        Card Number
                    </label>
                    <InputText
                        value={userInputs.cardNumber}
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        onFocus={() => markFieldAsTouched("cardNumber")}
                        onChange={handleCardNumberChange}
                        className={!isValid.cardNumber && isTouched.cardNumber ? "p-invalid" : ""}
                    />
                    {!isValid.cardNumber && isTouched.cardNumber && (
                        <small className="p-error">Invalid credit card number</small>
                    )}
                </div>
                <div className="credit-card-input">
                    <label htmlFor="card-holder-name" className="t14-sb">
                        Card Holder Name
                    </label>
                    <InputText
                        value={userInputs.cardHolderName}
                        id="card-holder-name"
                        placeholder="Adam Smith"
                        type="text"
                        onFocus={() => markFieldAsTouched("cardHolderHame")}
                        onChange={(e) => {
                            handleCardHolderNameChange(e.target.value);
                        }}
                        className={!isValid.cardHolderName && isTouched.cardHolderName ? "p-invalid" : ""}
                    />
                    {!isValid.cardHolderName && isTouched.cardHolderName && (
                        <small className="p-error">Can not be empty</small>
                    )}
                </div>
                <div className="credit-card-input">
                    <label htmlFor="expiry-date" className="t14-sb">
                        Expiry Date
                    </label>
                    <InputText
                        value={userInputs.expiryDate}
                        id="expiry-date"
                        placeholder="MM/YY"
                        onFocus={() => markFieldAsTouched("expiryDate")}
                        onChange={handleExpiryChange}
                        className={!isValid.expiryDate && isTouched.expiryDate ? "p-invalid" : ""}
                    />
                    {!isValid.expiryDate && isTouched.expiryDate && (
                        <small className="p-error">Invalid expiry date</small>
                    )}
                </div>
                <div className="credit-card-input">
                    <label htmlFor="cvv" className="t14-sb">
                        CVV
                    </label>
                    <InputText
                        value={userInputs.cvv}
                        id="cvv"
                        placeholder="334"
                        onFocus={() => markFieldAsTouched("cvv")}
                        onChange={handleCVVChange}
                        keyfilter="int"
                        className={!isValid.cvv && isTouched.cvv ? "p-invalid" : ""}
                    />
                    {!isValid.cvv && isTouched.cvv && <small className="p-error">Invalid CVV</small>}
                </div>
                <Button label="Pay Now" disabled={!isFormValid} onClick={handlePayNow} />
            </div>
        );
    }, [
        handleCardNumberChange,
        handleExpiryChange,
        handleCVVChange,
        isValid,
        userInputs,
        handlePayNow,
        paymentStatus,
        isTouched,
        markFieldAsTouched,
        handleCardHolderNameChange,
        currentRide
    ]);

    const actionDetails = {
        bookRide: {
            content: renderCreditCardPayment,
            disabled: !(isValid.cardNumber && isValid.expiryDate && isValid.cvv)
        }
    };

    const renderRides = useCallback(() => {
        const renderFooter = (ride) => {
            return (
                <div className="card-footer">
                    <div className="card-driver-info">
                        <span>Driver: {ride.driver_name}</span>
                        <span>vehicle: {ride.vehicle_id.make} {ride.vehicle_id.model}</span>
                    </div>
                    <div>
                        <Button
                            label="Book"
                            onClick={() => {
                                setCurrentRide(ride);
                                setActionPerformed("bookRide");
                                setVisible(true);
                            }}
                        />
                    </div>
                </div>
            );
        };
        if(listOfRides.length === 0){
            return <div className="t18-sb">No rides available for you right now!</div>
        }
        return filteredData.map((ride) => {
            return <RideCard key={ride.id} ride={ride} footer={renderFooter(ride)} />;
        });
    }, [filteredData]);


    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    const handleSearch = (e)=>{
        setSearchString(e.target.value);
        setFilteredData(searchRidesByInput(e.target.value, listOfRides))
    }

    return isLoading ? (
        <div>loading....</div>
    ) : (
        <div className="Home-container">
            <div className="search-container">
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText value={searchString} placeholder="Search rides..." className="rides-search" onChange={handleSearch}/>
                </IconField>
            </div>
            <div className="rides-container">{renderRides()}</div>

            <Dialog header={"Credit Card Payment"} visible={visible} onHide={closeDialog} style={{ width: "50rem" }}>
                <div style={{ padding: "1rem" }}>{actionDetails[actionPerformed]?.content()}</div>
            </Dialog>
        </div>
    );
};
