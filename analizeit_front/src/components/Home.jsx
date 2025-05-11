import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  TableContainer,
  Button,
  Center
} from "@chakra-ui/react";
import { getAnalysis } from "@/api/AnalysisApi";
import { Link } from "react-router-dom";
import { deleteAnalysis } from "@/api/AnalysisApi";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = JSON.parse(localStorage.getItem("auth")).userId; 
  const navigate = useNavigate();

  const fetchAnalyses = async () => {
    try {
      const response = await getAnalysis(userId);
      setAnalyses(response);
      console.log(response);
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    
    fetchAnalyses();
  }, []);
  const handleDelete = async (e) => {
    e.preventDefault();
    const analysisId = e.target.value;
    try {
      console.log("Deleting analysis with ID:", analysisId);
      await deleteAnalysis(analysisId, userId);
      fetchAnalyses();
    } catch (error) {
      console.error("Failed to delete analysis:", error);
    }
  };

  return (
    <Box maxW="6xl" mx="auto" mt="10" p="6" bg="white" borderRadius="lg" boxShadow="md">
      <Heading mb="6" size="lg" textAlign="center">
        Your Analyses of Enterprise Architecture
      </Heading>
      <Box textAlign="center" mb="6">
        <Button
          colorScheme="teal"
          onClick={() => navigate("/analysiscreation")}
        >
          Create New Analysis
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt="4">Loading your analyses...</Text>
        </Box>
      ) : analyses.length === 0 ? (
        <Text textAlign="center">No analyses found.</Text>
      ) : (
        <TableContainer>
          <Table variant="striped" colorScheme="teal">
            <Thead >
              <Tr>
                <Th textAlign="center">Date</Th>
                <Th textAlign="center">Title</Th>
                <Th textAlign="center">Description</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {analyses.map((analysis, index) => (
                <Tr key={index}>
                  <Td>{new Date(analysis.createdAt).toLocaleDateString()}</Td>
                  <Td>{analysis.name}</Td>
                  <Td>{analysis.description}</Td>
                  <Td>
                    <Button colorScheme= "teal" type="submit" m={2}
                          onClick={() => {
                            navigate(`/analysis/${analysis.id}`, { replace: true });
                          }}>
                            View Analysis
                          </Button>
                    <Button value = {analysis.id} bg="#F06449" color="white" type="submit" m={2} onClick={(e)=> handleDelete(e)}>X</Button>
                          </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Home;
