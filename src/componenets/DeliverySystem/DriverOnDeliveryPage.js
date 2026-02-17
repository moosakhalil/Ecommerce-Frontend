import React from "react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import DriverOnDeliveryDashboard from "./Driverondelivery";

const DriverOnDeliveryPage = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80">
        <DriverOnDeliveryDashboard />
      </div>
    </div>
  );
};

export default DriverOnDeliveryPage;
