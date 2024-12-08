import { InputText } from "primereact/inputtext";
import "./Profile.css";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { InputNumber } from "primereact/inputnumber";
import { CustomDialog } from "common-components/CustomDialog/CustomDialog";
import { ErrorMessage } from "common-components/ErrorMessage/ErrorMessage";
import useAuth from "hooks/useAuth";
import { axios } from "lib/axios";
import useError from "hooks/useError";
import { ProfileImage } from "./ProfileImage";
export const Profile = () => {
    const [visible, setVisible] = useState(false);
    const [actionPerformed, setActionPerformed] = useState("");
    const [vehicleInputs, setVehicleInputs] = useState({
        make: "",
        model: "",
        capacity: 0,
        license_plate: ""
    });
    const [vehicle, setVehicle] = useState("");
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        phone: "",
        license: ""
    });
    const [initialUserInfo, setInitialUserInfo] = useState({
        username: "",
        email: "",
        phone: "",
        license: "",
        city: "",
        street: "",
        ssn: "",
    });
    const [userInfoValidations, setUserInfoValidations] = useState({
        username: { valid: true, message: "" },
        email: { valid: true, message: "" },
        phone: { valid: true, message: "" },
        license: { valid: true, message: "" }
    });
    const [vehicleInputsValidations, setVehicleInputsValidations] = useState({
        make: { valid: false, message: "" },
        model: { valid: false, message: "" },
        capacity: { valid: false, message: "" },
        license_plate: { valid: false, message: "" }
    });
    const { user } = useAuth();
    const [vehiclesList, setVehiclesList] = useState([]);
    const { setErrorRef } = useError();
    const [earnings, setEarnings] = useState(0);
    const getVehicles = async () => {
        try {
            const response = await axios.get("/driver/get_vehicles_list");
            console.log(response);
            if (response.status === 200) {
                setVehiclesList(response.data?.data);
            }
        } catch (error) {
            setErrorRef.current(error);
        }
    };

    const getEarnings = async () => {
        try {
            const response = await axios.post("/driver/driver_earning");
            if (response.status === 200) {
                setEarnings(response.data?.data);
            }
        } catch (error) {
            setErrorRef.current(error);
        }
    };

    useEffect(() => {
        setInitialUserInfo({
            username: user?.username,
            email: user?.email,
            phone: user?.phone_number,
            license: user?.license_number,
            ssn: user?.ssn,
            city: user?.city,
            street: user?.street
        });
        if (user?.role === "driver") {
            Promise.all([getVehicles(), getEarnings()]);
        }
    }, [user]);

    const updateUserInfo = async () => {
        try {
            const response = await axios.put("/auth/update_user", {
                username: userInfo.username,
                email: userInfo.email,
                phone_number: userInfo.phone,
                license_number: userInfo.license
            });
            if (response.status === 200) {
                setInitialUserInfo(userInfo);
            }
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            onCancelDialog();
        }
    };

    const addVehicle = async () => {
        try {
            const response = await axios.post("/driver/add_vehicle", {
                vehicle_info: {
                    make: vehicleInputs.make,
                    model: vehicleInputs.model,
                    capacity: vehicleInputs.capacity,
                    license_plate: vehicleInputs.license_plate
                }
            });
            if (response.status === 200) {
                getVehicles();
            }
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            onCancelDialog();
        }
    };

    const deleteVehicle = async () => {
        try {
            const response = await axios.post("/driver/delete_vehicle", {
                license_plate: vehicle.license_plate
            });
            if (response.status === 200) {
                getVehicles();
            }
        } catch (error) {
            setErrorRef.current(error);
        } finally {
            onCancelDialog();
        }
    };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9- ]+$/;
    const numberRegex = /^(10|[1-9])$/;
    const licenseRegex = /^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{7,12}$/; // will work for most of the states in US
    const licensePlateRegex = /^[A-Z0-9- ]{6,10}$/; // change this if it doesn't work with most of the states
    const phoneRegex = /^\(\d{3}\)\d{3}-\d{4}$/;
    const nameRegex = /^[a-zA-Z ]+$/;

    const validateUserName = (value) => {
        setUserInfo((prev) => ({ ...prev, username: value }));
        if (!value) {
            setUserInfoValidations((prev) => ({
                ...prev,
                username: { valid: false, message: "Username is required" }
            }));
        } else if (!usernameRegex.test(value)) {
            setUserInfoValidations((prev) => ({
                ...prev,
                username: { valid: false, message: "Username should not contain special characters except hyphen" }
            }));
        } else {
            setUserInfoValidations((prev) => ({ ...prev, username: { valid: true, message: "" } }));
        }
    };

    const validateEmail = (value) => {
        if (!value) {
            setUserInfoValidations((prev) => ({ ...prev, email: { valid: false, message: "Email is required" } }));
        } else if (!emailRegex.test(value)) {
            setUserInfoValidations((prev) => ({ ...prev, email: { valid: false, message: "Invalid email" } }));
        } else {
            setUserInfoValidations((prev) => ({ ...prev, email: { valid: true, message: "" } }));
        }
    };

    const validatePhone = (value) => {
        if (!value) {
            setUserInfoValidations((prev) => ({
                ...prev,
                phone: { valid: false, message: "Phone number is required" }
            }));
        } else if (!phoneRegex.test(value)) {
            setUserInfoValidations((prev) => ({ ...prev, phone: { valid: false, message: "Phone number should be of format (123)456-7890" } }));
        } else {
            setUserInfoValidations((prev) => ({ ...prev, phone: { valid: true, message: "" } }));
        }
    };

    const validateLicense = (value) => {
        if (!value) {
            setUserInfoValidations((prev) => ({
                ...prev,
                license: { valid: false, message: "License number is required" }
            }));
        } else if (!licenseRegex.test(value)) {
            setUserInfoValidations((prev) => ({
                ...prev,
                license: {
                    valid: false,
                    message:
                        "License must be 7-12 characters long, contain at least one digit, one uppercase letter, and only consist of uppercase letters and digits."
                }
            }));
        } else {
            setUserInfoValidations((prev) => ({ ...prev, license: { valid: true, message: "" } }));
        }
    };

    const validateLicensePlate = (value) => {
        setVehicleInputs((prev) => ({ ...prev, license_plate: value }));
        if (!value) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                license_plate: { valid: false, message: "License plate is required" }
            }));
        } else if (!licensePlateRegex.test(value)) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                license_plate: { valid: false, message: "License plate can only have uppercase letters, digits, hyphens and spaces " }
            }));
        } else {
            setVehicleInputsValidations((prev) => ({ ...prev, license_plate: { valid: true, message: "" } }));
        }
    };

    const validateVehicleCapacity = (value) => {
        setVehicleInputs((prev) => ({ ...prev, capacity: value }));
        if (!value) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                capacity: { valid: false, message: "Vehicle capacity is required" }
            }));
        } else if (!numberRegex.test(value)) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                capacity: { valid: false, message: "Invalid vehicle capacity" }
            }));
        } else {
            setVehicleInputsValidations((prev) => ({ ...prev, capacity: { valid: true, message: "" } }));
        }
    };

    const validateVehicleMake = (value) => {
        setVehicleInputs((prev) => ({ ...prev, make: value }));
        if (!value) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                make: { valid: false, message: "Vehicle company is required" }
            }));
        } else if (!nameRegex.test(value)) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                make: { valid: false, message: "Vehicle company should only contain letters" }
            }));
        } else {
            setVehicleInputsValidations((prev) => ({ ...prev, make: { valid: true, message: "" } }));
        }
    };

    const validateVehicleModel = (value) => {
        setVehicleInputs((prev) => ({ ...prev, model: value }));
        if (!value) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                model: { valid: false, message: "Vehicle model is required" }
            }));
        } else if (!usernameRegex.test(value)) {
            setVehicleInputsValidations((prev) => ({
                ...prev,
                model: { valid: false, message: "Vehicle model should not contain any special characters except hyphen" }
            }));
        } else {
            setVehicleInputsValidations((prev) => ({ ...prev, model: { valid: true, message: "" } }));
        }
    };

    const validateUserInfoChange = () => {
        const isUserInfoChanged =
            userInfo.username !== initialUserInfo.username ||
            userInfo.email !== initialUserInfo.email ||
            userInfo.phone !== initialUserInfo.phone ||
            userInfo.license !== initialUserInfo.license;

        const isValidInfo =
            userInfoValidations.username.valid &&
            userInfoValidations.email.valid &&
            userInfoValidations.phone.valid &&
            (user?.role === "driver" ? userInfoValidations.license.valid : true);

        return isUserInfoChanged && isValidInfo;
    };

    const PersonalInfo = () => {
        return (
            <div className="profile-info-conatiner">
                <div className="profile-info-input-container">
                    <label htmlFor="username" className="t14">
                        Username
                    </label>
                    <div className="read-only-input-fields t14-sb">{initialUserInfo.username}</div>
                </div>
                <div className="profile-info-input-container">
                    <label htmlFor="email" className="t14">
                        Email
                    </label>
                    <div className="read-only-input-fields t14-sb">{initialUserInfo.email}</div>
                </div>
                <div className="profile-info-input-container">
                    <label htmlFor="phone" className="t14">
                        Phone Number
                    </label>
                    <div className="read-only-input-fields t14-sb">{initialUserInfo.phone}</div>
                </div>
                <div className="profile-info-input-container">
                    <label htmlFor="ssn" className="t14">
                        SSN
                    </label>
                    <div className="read-only-input-fields t14-sb">{initialUserInfo.ssn}</div>
                </div>
                <div className="profile-info-input-container">
                    <label htmlFor="city" className="t14">
                        City
                    </label>
                    <div className="read-only-input-fields t14-sb">{initialUserInfo.city}</div>
                </div>
                <div className="profile-info-input-container">
                    <label htmlFor="phone" className="t14">
                        street
                    </label>
                    <div className="read-only-input-fields t14-sb">{initialUserInfo.street}</div>
                </div>
                {user?.role === "driver" && (
                    <div className="profile-info-input-container">
                        <label htmlFor="license" className="t14">
                            License Number
                        </label>
                        {!!initialUserInfo.license || initialUserInfo.license !== "" ? (
                            <div className="read-only-input-fields t14-sb">{initialUserInfo.license}</div>
                        ) : (
                            <ErrorMessage message="Please add your license number to add vehicles" />
                        )}
                    </div>
                )}
                <Button
                    label="Edit"
                    className="edit-button input-buttons"
                    icon="pi pi-pen-to-square"
                    onClick={() => {
                        setVisible(true);
                        setActionPerformed("editUserInfo");
                        setUserInfo(initialUserInfo);
                    }}
                />
            </div>
        );
    };

    const VehicleCard = ({ vehicle }) => {
        return (
            <div className="vehicle-card">
                <div className="t14-sb">
                    {vehicle.make} {vehicle.model}
                </div>
                <div>
                    <div className="t14">Capacity: {vehicle.capacity}</div>
                    <div className="t14">License Plate: {vehicle.license_plate}</div>
                </div>
                <Button
                    className="vehicle-delete-icon"
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    tooltip="delete"
                    onClick={() => {
                        setVisible(true);
                        setVehicle(vehicle);
                        setActionPerformed("deleteVehicle");
                    }}
                />
            </div>
        );
    };

    const addVehicleDialogContent = (
        <div className="add-vehicle-container">
            <div className="add-vehicle-input">
                <label htmlFor="make" className="t14">
                    Vehicle Company
                </label>
                <InputText
                    id="make"
                    value={vehicleInputs.make}
                    className="input-fields t14"
                    onChange={(e) => {
                        validateVehicleMake(e.target.value);
                    }}
                />
                <ErrorMessage message={vehicleInputsValidations.make.message} />
            </div>
            <div className="add-vehicle-input">
                <label htmlFor="model" className="t14">
                    Vehicle Model
                </label>
                <InputText
                    id="model"
                    value={vehicleInputs.model}
                    className="input-fields t14"
                    onChange={(e) => validateVehicleModel(e.target.value)}
                />
                <ErrorMessage message={vehicleInputsValidations.model.message} />
            </div>
            <div className="add-vehicle-input">
                <label htmlFor="capacity" className="t14">
                    Vehicle Capacity
                </label>
                <InputNumber
                    id="capacity"
                    className="input-fields t14"
                    value={vehicleInputs.capacity}
                    onValueChange={(e) => validateVehicleCapacity(e.value)}
                    mode="decimal"
                    showButtons
                    minFractionDigits={0}
                    maxFractionDigits={0}
                    min={0}
                    max={10}
                    step={1}
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    buttonLayout="horizontal"
                />
                <ErrorMessage message={vehicleInputsValidations.capacity.message} />
            </div>
            <div className="add-vehicle-input">
                <label htmlFor="license-plate" className="t14">
                    Vehicle license plate
                </label>
                <InputText
                    id="license-plate"
                    value={vehicleInputs.license_plate}
                    className="input-fields t14"
                    onChange={(e) => validateLicensePlate(e.target.value)}
                />
                <ErrorMessage message={vehicleInputsValidations.license_plate.message} />
            </div>
        </div>
    );

    const editUserInfoDialogContent = (
        <div className="profile-info-conatiner">
            <div className="profile-info-input-container">
                <label htmlFor="username" className="t14">
                    Username
                </label>
                <InputText
                    id="username"
                    value={userInfo.username}
                    className="input-fields t14"
                    onChange={(e) => {
                        setUserInfo((prev) => ({ ...prev, username: e.target.value }));
                        validateUserName(e.target.value);
                    }}
                />
                <ErrorMessage message={userInfoValidations.username.message} />
            </div>
            <div className="profile-info-input-container">
                <label htmlFor="email" className="t14">
                    Email
                </label>
                <InputText
                    id="email"
                    value={userInfo.email}
                    className="input-fields t14"
                    onChange={(e) => {
                        setUserInfo((prev) => ({ ...prev, email: e.target.value }));
                        validateEmail(e.target.value);
                    }}
                />
                <ErrorMessage message={userInfoValidations.email.message} />
            </div>
            <div className="profile-info-input-container">
                <label htmlFor="phone" className="t14">
                    Phone Number
                </label>
                <InputText
                    id="phone"
                    value={userInfo.phone}
                    className="input-fields t14"
                    onChange={(e) => {
                        setUserInfo((prev) => ({ ...prev, phone: e.target.value }));
                        validatePhone(e.target.value);
                    }}
                />
                <ErrorMessage message={userInfoValidations.phone.message} />
            </div>
            {user?.role === "driver" && (
                <div className="profile-info-input-container">
                    <label htmlFor="license" className="t14">
                        License Number
                    </label>
                    <InputText
                        id="license"
                        value={userInfo.license}
                        className="input-fields t14"
                        onChange={(e) => {
                            setUserInfo((prev) => ({ ...prev, license: e.target.value }));
                            validateLicense(e.target.value);
                        }}
                    />
                    <ErrorMessage message={userInfoValidations.license.message} />
                </div>
            )}
        </div>
    );

    const DialogFooter = () => {
        return (
            <div>
                <Button label="Cancel" text className="input-buttons" onClick={onCancelDialog} />
                <Button
                    label={actions[actionPerformed]?.buttonLabel}
                    className="input-buttons"
                    onClick={actions[actionPerformed]?.action}
                    disabled={!actions[actionPerformed]?.disable()}
                />
            </div>
        );
    };

    const onCancelDialog = () => {
        setVisible(false);
        setVehicleInputs({
            make: "",
            model: "",
            capacity: 0,
            license_plate: ""
        });
        setVehicle("");
        setActionPerformed("");
        setVehicleInputsValidations({
            make: { valid: true, message: "" },
            model: { valid: true, message: "" },
            capacity: { valid: true, message: "" },
            license_plate: { valid: true, message: "" }
        });
        setUserInfo({
            username: "",
            email: "",
            phone: "",
            license: ""
        });
    };

    const actions = {
        addVehicle: {
            header: "Add Vehicle",
            content: addVehicleDialogContent,
            action: addVehicle,
            buttonLabel: "Add Vehicle",
            disable: () => {
                return (
                    vehicleInputsValidations.make.valid &&
                    vehicleInputsValidations.model.valid &&
                    vehicleInputsValidations.capacity.valid &&
                    vehicleInputsValidations.license_plate.valid
                );
            }
        },
        deleteVehicle: {
            header: "Delete Vehicle",
            content: <div>Are you sure you want to delete this vehicle?</div>,
            action: deleteVehicle,
            buttonLabel: "Delete Vehicle",
            disable: () => true
        },
        editUserInfo: {
            header: "Edit User Info",
            content: editUserInfoDialogContent,
            action: updateUserInfo,
            buttonLabel: "Edit User Info",
            disable: validateUserInfoChange
        }
    };

    return (
        <div className="profile-container">
            <div>
                <div className={user?.role === "driver" ? "profile-info" : "profile-info-non-driver"}>
                    <div className="t18-sb personal-details-heading" >
                        <span>Personal Details</span>
                        <ProfileImage/>
                    </div>
                    <PersonalInfo />
                </div>
                {user?.role === "driver" && (
                    <div className="profile-earnings">
                        <div className="t18-sb">My Earnings</div>
                        <div className="t16">$ {earnings}</div>
                    </div>
                )}
            </div>
            {
                user?.role === "driver" && (
                    <div className="profile-vehicles">
                        <div className="profile-vehicle-header">
                            <div className="t18-sb">My Vehicles</div>
                            <Button
                                label="Add Vehicle"
                                className="input-buttons"
                                icon="pi pi-plus"
                                onClick={() => {
                                    setVisible(true);
                                    setActionPerformed("addVehicle");
                                }}
                                disabled={initialUserInfo.license == "" || initialUserInfo.license == null}
                            />
                        </div>
                        {vehiclesList.map((vehicle) => {
                            return <VehicleCard vehicle={vehicle} />;
                        })}
                    </div>
                )
            }
            <CustomDialog
                header={<div>{actions[actionPerformed]?.header}</div>}
                visible={visible}
                footer={<DialogFooter />}
                onHide={onCancelDialog}
            >
                {actions[actionPerformed]?.content}
            </CustomDialog>
        </div>
    );
};
