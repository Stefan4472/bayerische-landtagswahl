import axios, {AxiosInstance} from "axios";

let axiosInstance: AxiosInstance;

export default axiosInstance = axios.create({
    baseURL: "/api",
    headers: {
        "Content-type": "application/json",
        'Accept': 'application/json'
    }
});