import React, { useState } from "react";
import { Box, Input, Button, Heading, Stack } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {login as log_in} from '../api/authApi';

const Login = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
  
    const handleLogin = (e) => {
      e.preventDefault();
      console.log("Login submitted:", { login, password });
      log_in(login, password).then((data) => {
        console.log("Login response:", data);
        const authData = {
          userId: data.decodedData.sub,
          userToken: data.userToken,
          exp: data.decodedData.exp,
        };
        localStorage.setItem("auth", JSON.stringify(authData));

        setAuth(authData);
        setLogin("");
        setPassword("");
        navigate(from, { replace: true });
      }).catch((error) => {
        console.error("Login error:", error);
        setError(error.response?.data || "Login failed. Please try again.");
      });

      // Тут можна додати логіку авторизації
    };
    return (
      <Box
      className=" w-[400px] mx-auto rounded-2xl shadow-2xl" p="8"  mt="100px"
      >
      <Heading mb="6" textAlign="center" className="text-3xl font-bold">
      Sign In
      </Heading>
      {error && (
        <Box color="red.500" textAlign="center" mb="4">
          {error}
        </Box>
        )}
      <form onSubmit={handleLogin}>
      <Stack spacing="4">
        <FormControl isRequired pb="6">
        <FormLabel>Login</FormLabel>
        <Input
          type="login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Enter your login"
        />
        </FormControl>

        <FormControl isRequired pb="6">
        <FormLabel className="text-lg">Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        </FormControl>

        

        <Button
        colorScheme="teal"
        type="submit"
        >
        Login
        </Button>

        <Link to="/register" className="text-center text-lg text-gray-500 hover:text-red-500">Don't have an account? Register</Link>
      </Stack>
      </form>
    </Box>
    );
};
export default Login;