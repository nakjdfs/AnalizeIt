import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider';
import { ChakraProvider } from "@chakra-ui/react";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <ChakraProvider>
    <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
    </BrowserRouter>
    </ChakraProvider>
    </AuthProvider>
  </StrictMode>,
)
