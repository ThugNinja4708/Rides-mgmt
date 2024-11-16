import Axios from "axios";
import { Cookies } from "react-cookie";

const cookie = new Cookies();
export const axios = Axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials:true
})

axios.interceptors.request.use(
    (config) => {
        const excludedPaths = ["/login", "/signUp"];
        const isExcludedPath = excludedPaths.some((path) => config.url.includes(path));
        if (!isExcludedPath) {
            config.headers["Authorization"] = `Bearer ${cookie.get("access_token")}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const err = new Error();
        err.status = error?.response?.status;
        err.message = error?.response?.data?.message;
        throw err;
    }
);