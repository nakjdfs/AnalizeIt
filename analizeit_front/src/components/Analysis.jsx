import React, { use, useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Divider,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
  Button,
  VStack,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { downloadFile, getAnalysisById } from "@/api/AnalysisApi";
import { useNavigate } from "react-router-dom";



const Analysis = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = JSON.parse(localStorage.getItem("auth")).userId;
    const toast = useToast();
  
    useEffect(() => {
      const fetchAnalysis = async () => {
        try {
          const response = await getAnalysisById(id, userId); 
          console.log(response);
          setAnalysis(response);
        } catch (err) {
          console.error("Error loading analysis:", err);
          toast({
            title: "Error loading analysis",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };
  
      fetchAnalysis();
    }, [id]);
  
    if (loading) {
      return (
        <Box textAlign="center" mt="20">
          <Spinner size="xl" />
          <Text mt="4">Loading analysis details...</Text>
        </Box>
      );
    }
  
    if (!analysis) {
      return <Text textAlign="center">Analysis not found.</Text>;
    }
    const handleDownloadPDF = async () => {
      try {
        const blob = await downloadFile(analysis.id);

        const url = window.URL.createObjectURL(blob); 
        const a = document.createElement("a");
        a.href = url;
        a.download = `${analysis.name.replace(/\s+/g, "_")}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download PDF:", error);
        toast({
          title: "An error occurred while downloading the PDF.",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };


    const getHeatColor = (value) => {
      if (typeof value !== "number") return "transparent";
      if (value === 0) return "gray.100";
      if (value === 1) return "#FEEBCB";      // light orange
      if (value === 2) return "#FBD38D";      // medium
      if (value === 3) return "#F6AD55";      // darker
      return "#F06449";                      // tomato
    };
  
    return (
      <Box maxW="6xl" mx="auto" mt={10} p={8} bg="white" boxShadow="xl" borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <Heading size="xl" color="teal.600">{analysis.name}</Heading>

        <Text fontSize="md" color="gray.700">
          <strong>Description:</strong> {analysis.description}
        </Text>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>Metadata</Heading>
          <Table variant="striped" size="sm">
            <Tbody>
              <Tr>
                <Td fontWeight="semibold">Created At</Td>
                <Td>{new Date(analysis.createdAt).toLocaleString()}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">C Variable</Td>
                <Td>
                  <Badge
                    fontSize="md"
                    p={1.5}
                    borderRadius="md"
                    colorScheme={
                      analysis.cVariable < 0.9
                        ? "red"
                        : analysis.cVariable > 1.1
                        ? "orange"
                        : "green"
                    }
                  >
                    {analysis.cVariable}
                  </Badge>
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <Box p="2" border="1px solid" borderColor="gray.200" borderRadius="md" bg="gray.50" textAlign="left">
            <Text fontSize="sm" color="gray.600" mt={2}> <Text as="span" fontWeight="semibold">C Variable Meaning:</Text><br /> 
            <Text as="span" color="red.500">Red (C &lt; 1)</Text>: Insufficient automation<br /> 
            <Text as="span" color="green.500">Green (C = 1)</Text>: Ideal balance<br /> 
            <Text as="span" color="orange.500">Orange (C &gt; 1)</Text>: Redundancy/duplication </Text>
          </Box>
        </Box>

        <Box textAlign="center" mt={6}>
          <Button colorScheme="teal" size="md" onClick={() => navigate("/")}>
            Return to Analyses
          </Button>
          <Button colorScheme="teal" size="md" ml={4} onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Box>

        <Box>
          <Heading size="md" mb={3}>Matrix</Heading>
          <Box
            maxH="500px"
            overflow="auto"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={2}
            bg="gray.50"
          >
            <Table variant="simple" size="sm">
              <Thead bg="gray.100" position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th>Component / Process</Th>
                  {analysis.applicationComponents?.map((bp, index) => (
                    <Th key={index}>{bp.label}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {analysis.matrixA?.map((row, rowIndex) => (
                  <Tr key={rowIndex}>
                    <Td fontWeight="semibold" bg="gray.100">
                      {analysis.businessProcesses?.[rowIndex]?.label || `Row ${rowIndex + 1}`}
                    </Td>
                    {row.map((cell, colIndex) => (
                      <Td bg={getHeatColor(cell)} textAlign="center" key={colIndex}>{cell}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    </Box>
    );
}; 


export default Analysis;