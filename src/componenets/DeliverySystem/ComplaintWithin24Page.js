import React from "react";
import Sidebar from "../Sidebar/sidebar";
import ComplaintManagement from "./ComplainManagement";

const ComplaintWithin24Page = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80">
        <ComplaintManagement timeFilter="within24" />
      </div>
    </div>
  );
};

export default ComplaintWithin24Page;
