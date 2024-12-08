import {axios} from "../../lib/axios";
export const signUpAPI = async (data) => {
    const response = await axios.post("/auth/signup", {
        "ssn": data.ssn,
        "username": data.username,
        "city": data.city,
        "street": data.street,
        "email": data.email,
        "password": data.password,
        "phone_number": data.phone,
        "role": data.role
    });
    return response.data;
};