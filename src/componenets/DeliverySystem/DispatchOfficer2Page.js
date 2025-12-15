import React from "react";
import Sidebar from "../Sidebar/sidebar";
import DispatchOfficer2Dashboard from "./DispatchOfficer2";

const DispatchOfficer2Page = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80">
        <DispatchOfficer2Dashboard />
      </div>
    </div>
  );
};

export default DispatchOfficer2Page;
