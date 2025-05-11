import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Text, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import axios from "axios";
import { verifyEmail as verification} from "@/api/authApi";

const Verification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // "loading", "success", "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token not found in URL.");
      return;
    }

    // Надіслати token на сервер
    const verifyEmail = async () => {
      try {
        const response = await verification( token)
        console.log(response)
        setStatus("success");
        setMessage("Email successfully verified! You can now log in.");
      } catch (err) {
        //console.error("Verification error:", err);
        setStatus("error");
        if (err.response?.data?.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Verification failed. Please try again later.");
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <Box
      maxW="md"
      mx="auto"
      mt="20"
      p="8"
      borderWidth="1px"
      borderRadius="lg"
      textAlign="center"
      bg="white"
      boxShadow="lg"
    >
      {status === "loading" && (
        <>
          <Spinner size="xl" mb="4" />
          <Text>Verifying your email...</Text>
        </>
      )}

      {status === "success" && (
        <Alert status="success" variant="left-accent" borderRadius="md">
          <AlertIcon />
          {message}
        </Alert>
      )}

      {status === "error" && (
        <Alert status="error" variant="left-accent" borderRadius="md">
          <AlertIcon />
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default Verification;