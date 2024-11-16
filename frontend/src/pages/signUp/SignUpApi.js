import axios from "axios";
export const signUpAPI = async (data) => {
    const response = await axios.post("/signup", {
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "phone_number": data.phone,
        "role": data.role
    });
    return response.data;
};