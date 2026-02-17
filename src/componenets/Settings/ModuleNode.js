/**
 * ModuleNode - Custom React Flow node for displaying chatbot modules
 * Shows module information with expand/collapse functionality
 */

import React, { useState } from "react";
import { Handle, Position } from "reactflow";

const ModuleNode = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(data.expanded || false);

  const handleExpandToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleViewMessages = (e) => {
    e.stopPropagation();
    if (data.onViewMessages) {
      data.onViewMessages(data.moduleId);
    }
  };

  const handleViewFlowchart = (e) => {
    e.stopPropagation();
    if (data.onViewFlowchart) {
      data.onViewFlowchart(data.moduleId);
    }
  };

  const getHealthBadge = () => {
    if (!data.health) return null;

    const healthConfig = {
      good: { bg: "bg-green-100", text: "text-green-800", icon: "✓" },
      warning: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⚠" },
      critical: { bg: "bg-red-100", text: "text-red-800", icon: "⚠" },
    };

    const config = healthConfig[data.health] || healthConfig.good;

    return (
      <div
        className={`${config.bg} ${config.text} px-2 py-0.5 rounded text-xs flex items-center gap-1`}
      >
        <span>{config.icon}</span>
        <span>{data.health}</span>
      </div>
    );
  };

  return (
    <div
      className={`
        relative rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? "ring-4 ring-blue-500/50 scale-105" : ""}
        ${isExpanded ? "shadow-2xl" : "hover:shadow-xl"}
        bg-white
      `}
      style={{
        borderColor: data.color,
        minWidth: isExpanded ? "320px" : "220px",
        maxWidth: "400px",
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: data.color,
          width: 12,
          height: 12,
          border: "2px solid white",
        }}
      />

      {/* Module Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer rounded-t-xl"
        onClick={handleExpandToggle}
        style={{
          backgroundColor: data.color,
          backgroundImage: `linear-gradient(135deg, ${data.color} 0%, ${data.color}dd 100%)`,
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl" role="img" aria-label={data.name}>
            {data.icon}
          </span>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">
              {data.name}
            </span>
            <span className="text-white/80 text-xs">
              Module {data.moduleId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 text-white px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm">
            {data.messageCount} msg{data.messageCount !== 1 ? "s" : ""}
          </span>
          <span
            className="text-white text-lg transition-transform duration-200"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Collapsed View - Description */}
      {!isExpanded && data.description && (
        <div className="px-3 py-2 text-xs text-gray-600 border-t border-gray-100">
          {data.description}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {/* Description */}
          {data.description && (
            <div
              className="text-xs text-gray-700 italic border-l-2 pl-2"
              style={{ borderColor: data.color }}
            >
              {data.description}
            </div>
          )}

          {/* Health Badge */}
          {data.health && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">
                Health:
              </span>
              {getHealthBadge()}
            </div>
          )}

          {/* Entry Points */}
          {data.entryPoints && data.entryPoints.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <span style={{ color: data.color }}>→</span>
                Entry Points:
              </div>
              <ul className="ml-4 space-y-0.5">
                {data.entryPoints.map((point, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-600 flex items-start gap-1"
                  >
                    <span className="text-gray-400">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exit Points */}
          {data.exitPoints && data.exitPoints.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <span style={{ color: data.color }}>←</span>
                Exit Points:
              </div>
              <ul className="ml-4 space-y-0.5">
                {data.exitPoints.map((point, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-600 flex items-start gap-1"
                  >
                    <span className="text-gray-400">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* States */}
          {data.states && data.states.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-700">States:</div>
              <div className="flex flex-wrap gap-1">
                {data.states.slice(0, 5).map((state, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                  >
                    {state}
                  </span>
                ))}
                {data.states.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{data.states.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View Messages Button */}
          <button
            className="w-full py-2 rounded text-xs font-semibold text-white transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: data.color,
              boxShadow: `0 2px 8px ${data.color}40`,
            }}
            onClick={handleViewMessages}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${data.color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 2px 8px ${data.color}40`;
            }}
          >
            📋 View All {data.messageCount} Messages
          </button>

          {/* View Flowchart Button */}
          <button
            className="w-full py-2 rounded text-xs font-semibold text-white transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: "#8b5cf6",
              boxShadow: "0 2px 8px rgba(139, 92, 246, 0.25)",
            }}
            onClick={handleViewFlowchart}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(139, 92, 246, 0.25)";
            }}
          >
            📊 View Module Flowchart
          </button>
        </div>
      )}

      {/* Module ID Badge (bottom-right corner) */}
      <div
        className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white"
        style={{ backgroundColor: data.color }}
      >
        {data.moduleId}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: data.color,
          width: 12,
          height: 12,
          border: "2px solid white",
        }}
      />
    </div>
  );
};

export default ModuleNode;
