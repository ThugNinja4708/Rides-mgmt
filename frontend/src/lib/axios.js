import axios from "axios";
import useAuth from "../hooks/useAuth";
const axios = axios.create({
    baseURL: "http://localhost:3000",
})

axios.interceptors.request.use(
    (config) => {
        const {user} = useAuth();
        const excludedPaths = ["/login", "/signUp"];
        const isExcludedPath = excludedPaths.some((path) => config.url.includes(path));
        if (user && !isExcludedPath) {
            config.headers["Authorization"] = `Bearer ${user.token}`;
        }
        return config;
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