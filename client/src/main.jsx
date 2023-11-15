import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Header from "./components/Header.jsx"
import Landing from "./pages/Landing"
import DashBoard from "./pages/Dashboard.jsx"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <React.StrictMode>
      <Header/>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/Dashboard" element={<DashBoard />} />
      </Routes>
    </React.StrictMode>
  </Router>
);