import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Missing from './components/Missing';
import Verification from './components/Verification';
import RequireAuth from './components/RequireAuth';
import Home from './components/Home';
import Analysis from './components/Analysis';
import AnalysisCreaction from './components/AnalysisCreation';
import Header from './components/Header';

function App() {

  return (
    <>  
      <Header/>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verification" element={<Verification />} />

          {/* we want to protect these routes */}
          <Route element={<RequireAuth/>}>
            <Route path="/" element={<Home />} />
            <Route path="/analysis/:id" element={<Analysis />} />
            <Route path="/analysiscreation" element={<AnalysisCreaction />} />
          </Route>

          {/* catch all */}
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </>
  )
}

export default App

