import React from "react";
import Sidebar from "../Sidebar/sidebar";
import DispatchOfficer1Dashboard from "./DispatchOfficer1Dashboard";

const DispatchOfficer1Page = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80">
        <DispatchOfficer1Dashboard />
      </div>
    </div>
  );
};

export default DispatchOfficer1Page;
