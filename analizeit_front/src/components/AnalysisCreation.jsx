import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Heading,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { createAnalysis, uploadFile } from "@/api/AnalysisApi";
import { useNavigate } from "react-router-dom";

const AnalysisCreaction = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const toast = useToast();
  const userId = JSON.parse(localStorage.getItem("auth")).userId;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let filePath = "";

    if (file) {
      const formData = new FormData();
      formData.append("xmlFile", file);

      try {
        const uploadRes = await uploadFile(formData);
        console.log(uploadRes);
        filePath = uploadRes.fileName;
      } catch (err) {
        toast({
          title: "Error uploading file",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    try {
      const res = await createAnalysis( {
        name,
        description,
        filePath,
        userId,
      });
      console.log(res);

      toast({
        title: "Analysis created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setName("");
      setDescription("");
      setFile(null);

      navigate(`/analysis/${res.analysisId}`);
    } catch (err) {
      toast({
        title: "An error occurred",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt="10" p="6" bg="white" boxShadow="md" borderRadius="md">
      <Heading mb="6">Analysis Creation</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb="4" isRequired>
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>

        <FormControl mb="4" isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormControl>

        <FormControl mb="4">
          <FormLabel>File (XML)</FormLabel>
          <Box
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            p="2"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {file ? (
              <Box>
                <strong>Uploaded:</strong> {file.name}
              </Box>
            ) : (
              <Box color="gray.500">No file selected</Box>
            )}
            <Input
              type="file"
              accept=".xml"
              onChange={(e) => setFile(e.target.files[0])}
              display="none"
              id="file-upload"
            />
            <Button as="label" htmlFor="file-upload" colorScheme="teal" size="sm">
              {file ? "Change File" : "Upload File"}
            </Button>
          </Box>
        </FormControl>

        <Button type="submit" colorScheme="teal" mt="4" mr="4" size="md">
          Create new analysis
        </Button>
        <Button colorScheme="gray" mt="4" ml="4" onClick={() => navigate("/")} size="md">
          Back to Home
        </Button>
      </form>
    </Box>
  );
};

export default AnalysisCreaction;
