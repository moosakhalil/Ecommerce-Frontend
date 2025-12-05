import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "3px",
      }}
    >
      <button
        onClick={handleClick}
        style={{
          padding: "3px 7px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px", // Space between text and arrow
        }}
      >
        Go to Dashboard
        <span style={{ fontSize: "16px" }}>→</span>
      </button>
    </div>
  );
};

export default DashboardButton;
