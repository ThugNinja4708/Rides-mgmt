import Axios from "axios";

export const axios = Axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

const statusCodes = {
    400: "Bad request",
    403: "Forbidden",
    404: "Resource not found",
    500: "Internal server error",
    424: "Identity api failed to respond",
};

axios.interceptors.request.use(
    (config) => {
        const excludedPaths = ["/login", "/signup"];
        const isExcludedPath = excludedPaths.some((path) => config.url.includes(path));
        if (!isExcludedPath) {
            const token = localStorage.getItem("authToken")
                config.headers["Authorization"] = `Bearer ${token}`;
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
        err.message = error?.response?.data?.message || statusCodes[err.status] || error?.message;
        throw err;
    }
);