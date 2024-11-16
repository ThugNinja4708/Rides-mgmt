import {axios} from "../../lib/axios";
export const signUpAPI = async (data) => {
    const response = await axios.post("/auth/signup", {
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "phone_number": data.phone,
        "role": data.role
    });
    return response.data;
};