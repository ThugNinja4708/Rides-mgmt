import React, { useCallback, useEffect, useState,useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { RideCard } from "common-components/RideCard/RideCard";
import { axios } from "lib/axios";
import {
    validateCreditCard,
    validateCVV,
    validateExpiryDate,
    getUsersCurrentLocation,
    searchRidesByInput
} from "lib/utils";
import { Button } from "primereact/button";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
import "./RiderHome.css";
import paymentImage from "images/payment complete animation.gif";
import { bookRideApi } from "./RiderHomeAPI.js";
import Spinner from "common-components/Spinner/Spinner";
import { Dropdown } from "primereact/dropdown";
import useError from "hooks/useError";
import {  useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";

export const RiderHome = () => {
    const [listOfRides, setListOfRides] = useState([]);
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState();
    const [userInputs, setUserInputs] = useState({
        cardNumber: "",
        expiryDate: "",
        cardHolderName: "",
        cvv: null,
        riderPickupLocation: ""
    });
    const [isValid, setIsValid] = useState({ cardNumber: false, expiryDate: false, cvv: false, cardHolderName: false });
    const [paymentStatus, setPaymentStatus] = useState("");
    const [currentRide, setCurrentRide] = useState(null);
    const [searchString, setSearchString] = useState();
    const [filteredData, setFilteredData] = useState([]);
    const [step, setStep] = useState(1);
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState({ getPlaces: false, getRides: false });

    const [isTouched, setIsTouched] = useState({
        cardNumber: false,
        expiryDate: false,
        cvv: false,
        cardHolderName: false
    });
    const { setErrorRef } = useError();
    const pickupRef = useRef(null);
    const libraries = ["places"];
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: "AIzaSyDJ6xZxVNPiNVWIGsE82M1tOGeqHfGX7dI",
        libraries: libraries
    });
    const [isValidLocation,setIsValidLocation] = useState(true);

    const nextStep = () => {
        setStep((prevStep) => prevStep + 1);
    };

    const prevStep = () => {
        setStep((prevStep) => prevStep - 1);
    };

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
        setUserInputs((prev) => ({
            cardNumber: "",
            expiryDate: "",
            cardHolderName: "",
            cvv: null,
            riderPickupLocation: ""
        }));
        setPaymentStatus(false);
        setIsValid((prev) => ({ cardNumber: false, expiryDate: false, cvv: false }));
        setIsTouched((prev) => ({ cardNumber: false, expiryDate: false, cvv: false }));
    }, []);

    const fetchRides = useCallback(() => {
        try {
            setIsLoading((prev) => ({ ...prev, getRides: true }));
            getUsersCurrentLocation()
                .then(async (location) => {
                    const response = await axios.post("/rider/get_all_available_rides", {
                        current_location: [location.lng, location.lat]
                    });
                    setListOfRides(response.data.data);
                    setFilteredData(response.data.data);
                })
                .catch((error) => {
                    setErrorRef.current(error);
                });
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, getRides: false }));
        }
    }, []);

    const handleOnPlacesChanged = (type) => {
        const ref = pickupRef;
        const place = ref.current.getPlaces?.()[0];
        if (place) {
            const location = {
                name: place.formatted_address || place.name,
                coordinates: {
                    lat: place.geometry.location.lng(),
                    lng: place.geometry.location.lat()
                }
            };
            setUserInputs((prev) => ({
                ...prev,
                riderPickupLocation: location
            }));
        }
        
    };

    const handlePayNow = useCallback(async () => {
        // Simulate payment processing
        const paymentInfo = {
            payment_method: "CARD",
            payment_status: "success"
        };
        const response = await bookRideApi(currentRide._id, paymentInfo, userInputs.riderPickupLocation);
        setPaymentStatus(true);
        setTimeout(() => {
            closeDialog();
            fetchRides();
        }, 3500);
    }, [currentRide, closeDialog, fetchRides, userInputs]);

    const renderCreditCardPayment = useCallback(() => {
        const isFormValid = isValid.cardNumber && isValid.expiryDate && isValid.cvv && isValid.cardHolderName;
        return paymentStatus ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={paymentImage} width={300} height={300} alt="success" />
            </div>
        ) : (
            <div className="credit-card-container">
                <span className="t14-sb " style={{ display: "flex", justifyContent: "center" }}>
                    {" "}
                    Make Payment for ${currentRide.price_per_seat}
                </span>
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
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button label="Go Back" onClick={prevStep} text iconPos="left" icon="pi pi-angle-left" />
                    <Button label="Pay Now" disabled={!isFormValid} onClick={handlePayNow} />
                </div>
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

    const renderRiderPickUpLocation = (currentRide) => {
        return isLoading.getPlaces ? (
            <Spinner />
        ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <StandaloneSearchBox
                    onLoad={(ref) => (pickupRef.current = ref)}
                    onPlacesChanged={() => handleOnPlacesChanged("pickup")}
                >
                    <InputText
                        type="text"
                        placeholder="Pickup Location"
                        className="input-fields"
                        value={userInputs.riderPickupLocation?.name || ""}
                        onChange={(e) =>
                            setUserInputs((prev) => ({
                                ...prev,
                                riderPickupLocation: { ...prev.riderPickupLocation, name: e.target.value }
                            }))
                        }
                    />
                </StandaloneSearchBox>
                {!isValidLocation && <small className="p-error">The distance between the selected location and the rider's pickup location must be within 5 miles.</small>}
                {/* <Dropdown
                    value={userInputs.riderPickupLocation}
                    onChange={(e) => setUserInputs((prev) => ({ ...prev, riderPickupLocation: e.value }))}
                    options={places}
                    placeholder="Select Pickup Location"
                    className="input-fields"
                    filter={true}
                /> */}
                <div>
                    <Button
                        label="Next"
                        icon="pi pi-angle-right"
                        iconPos="right"
                        style={{ width: "100px" }}
                        disabled={!userInputs.riderPickupLocation}
                        onClick={() => {
                            const rideLocation = currentRide.pickup_location.coordinates;
                            console.log("rideLocation",rideLocation);
                            console.log("riderlocation",userInputs.riderPickupLocation.coordinates.lng,userInputs.riderPickupLocation.coordinates.lat);
                            
                            
                            const distance = calculateDistanceInMiles(
                                userInputs.riderPickupLocation.coordinates.lng,
                                userInputs.riderPickupLocation.coordinates.lat,
                                rideLocation.coordinates.lng,
                                rideLocation.coordinates.lat
                            );
                            console.log("distance",distance);
                            if(distance > 5){
                                setIsValidLocation(false);
                            }
                            else{
                                setIsValidLocation(true);
                                nextStep();
                            }
                            // nextStep()
                            // if (distance > 5) {
                            //     alert("The distance between the selected location and the ride's pickup location must be within 5 miles.");
                            // } else {
                            //     nextStep();
                            // }
                        }}
                    />
                </div>
            </div>
        );
    };

    const getPlaces = () => {
        try {
            setIsLoading((prev) => ({ ...prev, getPlaces: true }));
            getUsersCurrentLocation()
                .then(async (location) => {
                    const response = await axios.post("/coordinates/get_places", {
                        lat: location.lat,
                        lng: location.lng
                    });
                    const placesList = Object.entries(response.data.data).map(([label, value]) => ({
                        label,
                        value: {
                            name: label,
                            coordinates: value
                        }
                    }));
                    setPlaces(placesList);
                })
                .catch((error) => {
                    setErrorRef.current(error);
                });;
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            setIsLoading((prev) => ({ ...prev, getPlaces: false }));
        }
    };

    useEffect(() => {
        if (actionPerformed === "bookRide") {
            getPlaces();
        }
    }, [actionPerformed]);

    const actionDetails = {
        bookRide: {
            header: step === 1 ? "Enter the pick up location" : "Credit Card Payment",
            content: step === 1 ? () => renderRiderPickUpLocation(currentRide) : renderCreditCardPayment,
            disabled: !(isValid.cardNumber && isValid.expiryDate && isValid.cvv),
            className: "dialog-sm"
        }
    };

    const calculateDistanceInMiles = (lat1, lon1, lat2, lon2) => {
        console.log("details",lat1,lon1,lat2,lon2);
        
        const toRad = (angle) => (angle * Math.PI) / 180;
        const R = 3958.8; // Earth's radius in miles
    
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const renderRides = useCallback(() => {
        const renderFooter = (ride) => {
            return (
                <div className="card-footer">
                    <div className="card-driver-info">
                        <span>Driver: {ride.driver_name}</span>
                        <span>
                            vehicle: {ride.vehicle_id.make} {ride.vehicle_id.model}
                        </span>
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
        if (listOfRides.length === 0) {
            return <div className="t18-sb">No rides available for you right now!</div>;
        }
        return filteredData.map((ride) => {
            return <RideCard key={ride.id} ride={ride} footer={renderFooter(ride)} />;
        });
    }, [filteredData, listOfRides]);

    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    const handleSearch = (e) => {
        setSearchString(e.target.value);
        setFilteredData(searchRidesByInput(e.target.value, listOfRides));
        console.log("filteredData",filteredData);
        
    };

    return (
        <div className="Home-container">
            <div className="search-container">
                <IconField iconPosition="left" className="search-field">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText
                        value={searchString}
                        placeholder="Search rides..."
                        className="rides-search"
                        onChange={handleSearch}
                    />
                </IconField>
            </div>
             {isLoading.getRides? <div>Loading.................</div>:<div className="rides-container">{renderRides()}</div>}

            <CustomDialog
                header={actionDetails[actionPerformed]?.header}
                visible={visible}
                onHide={closeDialog}
                className={actionDetails[actionPerformed]?.className}
            >
                <div>{actionDetails[actionPerformed]?.content(currentRide)}</div>
            </CustomDialog>
        </div>
    );
};
