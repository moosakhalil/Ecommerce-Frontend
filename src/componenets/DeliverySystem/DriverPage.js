import React from "react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import DriverDashboard from "./DriverDashboard";

const DriverPage = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80">
        <DriverDashboard />
      </div>
    </div>
  );
};

export default DriverPage;
