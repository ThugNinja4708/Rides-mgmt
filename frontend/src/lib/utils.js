
export const validateCreditCard = (number) => {
    const regex = new RegExp("^[0-9]{16}$");
    if (!regex.test(number.replace(/\s+/g, ""))) return false;

    let sum = 0;
    for (let i = 0; i < number.length; i++) {
        let intVal = parseInt(number.substr(i, 1));
        if (i % 2 === 0) {
            intVal *= 2;
            if (intVal > 9) {
                intVal = 1 + (intVal % 10);
            }
        }
        sum += intVal;
    }
    return (sum % 10) === 0;
};

export const validateExpiryDate = (expiryDate) => {
    const regex = new RegExp("^(0[1-9]|1[0-2])\/?([0-9]{2})$");
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
                reject(err);
            }
        );
    });
};