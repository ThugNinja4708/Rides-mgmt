import Axios from "axios";

export const axios = Axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

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
        err.message = error?.response?.data?.message;
        throw err;
    }
);