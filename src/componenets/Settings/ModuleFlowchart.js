/**
 * ModuleFlowchart - Displays detailed flowchart for a single module
 * Shows all messages within the module with their connections
 */

import React, { useState, useEffect, memo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { RefreshCw, ArrowLeft, Maximize2, Minimize2, Info } from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

// Reuse MessageNode component
const MessageNode = memo(({ data }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case "static":
        return "border-green-500 bg-green-50";
      case "template":
        return "border-yellow-500 bg-yellow-50";
      case "dynamic":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "static":
        return "✅";
      case "template":
        return "⚠️";
      case "dynamic":
        return "❌";
      default:
        return "📝";
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-md ${getTypeColor(data.type)} min-w-[250px] max-w-[400px] ${data.isStart ? "ring-4 ring-green-400 ring-offset-2" : ""}`}
    >
      <Handle type="target" position={Position.Top} />

      {data.isStart && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
          🚀 START
        </div>
      )}

      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg">{getTypeIcon(data.type)}</span>
        <div className="flex-1">
          <div className="font-mono text-xs text-gray-600 mb-1">
            Line {data.lineNumber} • {data.function}
          </div>
          <div className="font-medium text-sm text-gray-900 line-clamp-3">
            {data.content}
          </div>
          {data.state && (
            <div className="mt-2 text-xs bg-white px-2 py-1 rounded inline-block">
              State: {data.state}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

MessageNode.displayName = "MessageNode";

const nodeTypes = {
  messageNode: MessageNode,
};

function ModuleFlowchart({
  moduleId,
  moduleName,
  moduleIcon,
  moduleColor,
  onBack,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  /**
   * Auto-layout nodes using dagre
   */
  const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 350, height: 120 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 175,
          y: nodeWithPosition.y - 60,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  /**
   * Load flowchart data for the module
   */
  useEffect(() => {
    loadModuleFlowchart();
  }, [moduleId]);

  const loadModuleFlowchart = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Loading flowchart for module ${moduleId}...`);

      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/module/${moduleId}/flowchart`,
      );
      const data = await response.json();

      if (data.success) {
        setModuleData(data);

        // Process nodes
        const flowNodes = data.flowchart.nodes.map((node) => ({
          ...node,
          type: "messageNode",
        }));

        // Process edges with proper styling
        const flowEdges = data.flowchart.edges.map((edge) => {
          const isTransition = edge.edgeType === "transition";

          return {
            ...edge,
            animated: isTransition,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color:
                edge.style?.stroke || (isTransition ? "#3b82f6" : "#64748b"),
            },
          };
        });

        // Apply dagre layout
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(flowNodes, flowEdges, "TB");

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        console.log(
          `Loaded flowchart: ${layoutedNodes.length} messages, ${layoutedEdges.length} edges`,
        );
      } else {
        setError(data.error || "Failed to load module flowchart");
      }
    } catch (error) {
      console.error("Error loading module flowchart:", error);
      setError("Error loading module flowchart");
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading module flowchart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-50" : "relative"} h-full bg-gray-50`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white"
        style={{ borderBottomColor: moduleColor, borderBottomWidth: "3px" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to module overview"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-3xl">{moduleIcon}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {moduleName} Flowchart
            </h2>
            <p className="text-sm text-gray-600">
              {moduleData?.module.messageCount} messages •{" "}
              {moduleData?.stats.totalEdges} connections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle info panel"
          >
            <Info
              className={`w-5 h-5 ${showInfo ? "text-blue-600" : "text-gray-400"}`}
            />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={loadModuleFlowchart}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Flowchart */}
      <div className="h-[calc(100%-80px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        >
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Background variant="dots" gap={12} size={1} />

          {/* Info Panel */}
          {showInfo && (
            <Panel
              position="top-left"
              className="bg-white rounded-lg shadow-lg p-4 max-w-xs"
            >
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{moduleIcon}</span>
                  <div className="font-bold text-lg">{moduleName}</div>
                </div>

                <div className="space-y-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages:</span>
                    <span className="font-bold">
                      {moduleData?.stats.totalMessages}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connections:</span>
                    <span className="font-bold">
                      {moduleData?.stats.totalEdges}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sequential:</span>
                    <span className="font-bold">
                      {moduleData?.stats.sequentialEdges}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transitions:</span>
                    <span className="font-bold">
                      {moduleData?.stats.transitionEdges}
                    </span>
                  </div>
                </div>

                {moduleData?.states && moduleData.states.length > 0 && (
                  <div className="mb-4 pb-3 border-b border-gray-200">
                    <div className="font-semibold mb-2 text-gray-700">
                      States:
                    </div>
                    <div className="space-y-1">
                      {moduleData.states.map((state, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600">{state.name}</span>
                          <span className="font-semibold">
                            {state.messageCount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    💡 <strong>Green ring</strong> = Start message
                  </div>
                  <div>
                    🔵 <strong>Blue dashed</strong> = State change
                  </div>
                  <div>
                    ⚫ <strong>Gray solid</strong> = Sequential flow
                  </div>
                  <div>
                    🖱️ <strong>Drag</strong> to pan, <strong>scroll</strong> to
                    zoom
                  </div>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

export default ModuleFlowchart;
