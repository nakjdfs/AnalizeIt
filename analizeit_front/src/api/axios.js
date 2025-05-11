import axios from 'axios';

export default axios.create({
    baseURL: 'https://localhost:7143',
    headers: {
        'Content-Type': 'application/json',
    },
});
const $authHost = axios.create({
    baseURL: 'https://localhost:7143',
    headers: {
        'Content-Type': 'application/json',
    },
});

const authInterceptor = config => {
    const token = JSON.parse(localStorage.getItem('auth'))?.userToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};


$authHost.interceptors.request.use(authInterceptor)
export { $authHost };