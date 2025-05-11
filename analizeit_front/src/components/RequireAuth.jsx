import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";


const RequireAuth = () => {
    const { auth, setAuth } = useAuth();
    const location = useLocation();
    useEffect(() => {
        const savedAuth = localStorage.getItem("auth");
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            const isTokenExpired = authData.exp && Date.now() >= authData.exp * 1000;
    
            if (isTokenExpired) {
                localStorage.removeItem("auth"); // Clear expired token
                setAuth(null); // Reset context state
            } else {
                setAuth(authData); 
            }
        }
    }, []);

    return (
        auth?.userId
            ? <Outlet />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;