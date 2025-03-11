import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainSimulator from './components/MainSimulator';
import AboutPage from './components/AboutPage';
import MethodologyPage from './components/MethodologyPage';
import './styles/main.css';
import './styles/responsive.css';

function App() {
  return (
    <Router basename="/senedd_etholiad_sim">
      <div className="app-container">
        <Header />
        
        <nav className="main-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Simulator
          </NavLink>
          <NavLink to="/methodology" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Methodology
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            About
          </NavLink>
        </nav>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<MainSimulator />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;