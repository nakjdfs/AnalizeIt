import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { registration } from "../api/authApi";

const Register = () => {
    const [form, setForm] = useState({
        login: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    const loginRegex = /^[a-zA-Z0-9_-]{5,30}$/;
    const passRegex = /^[a-zA-Z0-9_-]{8,30}$/;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const toast = useToast();
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };
    
    const validate = () => {
        let newErrors = {};
        if (!form.login) {
            newErrors.login = "Login is required";
          } else if (!loginRegex.test(form.login)) {
            newErrors.login = "Login must be 5–30 chars: letters, digits, _ or -";
          }
      
          if (!form.email) {
            newErrors.email = "Email is required";
          } else if (!emailRegex.test(form.email)) {
            newErrors.email = "Invalid email format";
          }
      
          if (!form.password) {
            newErrors.password = "Password is required";
          } else if (!passRegex.test(form.password)) {
            newErrors.password = "Password must be 8–30 chars: letters, digits, _ or -";
          }
      
          if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
          }
        return newErrors;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Registration submitted:", form);
        const validation = validate();
        if (Object.keys(validation).length > 0) {
          setErrors(validation);
          return;
        }
        registration(form.login, form.email, form.password, form.confirmPassword)
          .then((data) => {
            console.log("Registration response:", data);
            navigate("/login", { replace: true });
          })
          .catch((error) => {
            console.error("Registration error:", error);
            setErrors({ ...errors, server: error.message });
            toast({
            title:  error.response.data,
            description: error.data,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          });
        
    };

    return (
        <Box
            className=" w-[400px] mx-auto rounded-2xl shadow-2xl" p="8" mt="12"
            bg="white"
            >
      <Heading mb="6" textAlign="center">
        Register
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing="5">
        <FormErrorMessage>{errors.server}</FormErrorMessage>
          <FormControl isInvalid={errors.login}>
            <FormLabel>Login</FormLabel>
            <Input
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="Your login"
              autoComplete="off"
            />
            <FormErrorMessage>{errors.login}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="off"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.confirmPassword}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="********"
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <Button colorScheme="teal" type="submit">
            Register
          </Button>
        </Stack>
      </form>
    </Box>
    );
};
export default Register;