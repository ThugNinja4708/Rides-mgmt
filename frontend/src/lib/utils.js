export const validateCreditCard = (number) => {
    const regex = new RegExp("^[0-9]{16}$");
    if (!regex.test(number.replace(/\s+/g, ""))) {
        return false;
    } else {
        return true;
    }
};

export const validateExpiryDate = (expiryDate) => {
    const regex = new RegExp("^(0[1-9]|1[0-2])/?([0-9]{2})$");
    if (!regex.test(expiryDate)) return false;

    const [month, year] = expiryDate.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        return false;
    }
    return true;
};

export const validateCVV = (cvv) => {
    const cvvRegex = /^\d{3,4}$/;
    return cvvRegex.test(cvv);
};

export const getUsersCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                resolve(location);
            },
            (err) => {
                console.log(err.message);
                const location = {
                    lat: 17.43451273072334,
                    lng: 78.37472035177288
                };
                resolve(location);
            }
        );
    });
};

export function searchRidesByInput(searchString, rides) {
    const input = searchString.toLowerCase();
    if (rides.length > 0) {
        return rides.filter((ride) => {
            return (
                ride.pickup_location?.coordinates?.location.toLowerCase().includes(input) ||
                ride.drop_location?.coordinates?.location.toLowerCase().includes(input) ||
                ride.status?.toLowerCase().includes(input) ||
                String(ride.price_per_seat).includes(input) ||
                ride.start_time.includes(input) ||
                ride.vehicle_id?.make.toLowerCase().includes(input) ||
                ride.vehicle_id?.model.toLowerCase().includes(input) ||
                ride.vehicle_id?.license_plate.toLowerCase().includes(input)
            );
        });
    }
}
