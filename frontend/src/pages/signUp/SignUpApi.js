import {axios} from "../../lib/axios";
export const signUpAPI = async (data) => {
    const response = await axios.post("/auth/signup", {
        "ssn": data.ssn,
        "username": data.username,
        "city": data.city,
        "state": data.state,
        "email": data.email,
        "password": data.password,
        "phone_number": data.phone,
        "role": data.role
    });
    return response.data;
};