
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from 'react-redux';
import store from './store';
import Header from "./components/Header.jsx"
import Landing from "./pages/Landing"
import Login from "./components/AuthenticationComponents/Login.jsx"
import Register from "./components/AuthenticationComponents/Register.jsx";
import DashBoard from "./pages/Dashboard.jsx"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Router>
      <React.StrictMode>
        <Header/>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Dashboard" element={<DashBoard />} />
        </Routes>
      </React.StrictMode>
    </Router>
  </Provider>
);