import {jwtDecode} from "jwt-decode";
import axios from "./axios";
import {$authHost} from "./axios";



export const registration = async (login, email, password, rpassword) => {
    const {data} = await axios.post('/User/user-registration', {login, email, password, rpassword})
    return data
}

export const login = async (login, password) => {
        const {data} = await axios.post('/User/login', {login, password})
        console.log(data)
        localStorage.setItem('userToken', data.userToken)
        const decodedData = jwtDecode(data.userToken)
        return {userToken: data.userToken, decodedData}
}
export const logout = async () => {
    const {data} = await axios.post('/User/logout')
    return data
}
export const deleteUser = async (id) => {
    const {data} = await $authHost.delete(`/User/delete-user/${id}`)
    return data
}

export const verifyEmail = async (token) => {
    const {data} = await axios.get("/User/verify-email?token=" + token)
    return data;
}