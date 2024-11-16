import {axios} from "../../lib/axios";
export const loginAPI = async (data) => {
    const response = await axios.post("/auth/login", {
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "role": data.role
    });
    return response.data;
};