import React, { useState, useEffect, useCallback, memo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import ModuleNode from "./ModuleNode";
import ModuleFlowchart from "./ModuleFlowchart";
import {
  MessageSquare,
  Save,
  RefreshCw,
  FileCode,
  AlertCircle,
  CheckCircle,
  Edit3,
  Trash2,
  Clock,
  Download,
  Upload,
  History,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Zap,
  Database,
  Code,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

// Custom Node Component for Messages
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

// Custom Node Component for States
const StateNode = memo(({ data }) => {
  return (
    <div className="px-6 py-4 rounded-xl border-2 border-blue-500 bg-blue-50 shadow-lg min-w-[200px]">
      <Handle type="target" position={Position.Top} />

      <div className="text-center">
        <div className="text-2xl mb-2">🔵</div>
        <div className="font-bold text-lg text-blue-900">{data.label}</div>
        <div className="text-sm text-blue-700 mt-1">
          {data.messageCount || 0} messages
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

StateNode.displayName = "StateNode";

// Custom Decision Node (Diamond Shape for User Choices)
const DecisionNode = memo(({ data }) => {
  return (
    <div className="relative" style={{ width: 200, height: 200 }}>
      <Handle type="target" position={Position.Top} style={{ top: 0 }} />

      {/* Diamond shape */}
      <div
        className="absolute inset-0 bg-yellow-400 border-4 border-yellow-600 shadow-xl"
        style={{
          transform: "rotate(45deg)",
          margin: "30px",
        }}
      />

      {/* Content (not rotated) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="text-3xl mb-2">◇</div>
        <div className="font-bold text-sm text-gray-900 text-center px-2">
          {data.label}
        </div>
        {data.choices && data.choices.length > 0 && (
          <div className="text-xs text-gray-700 mt-1">
            {data.choices.length} choices
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ bottom: 0 }} />
      <Handle type="source" position={Position.Left} style={{ left: 0 }} />
      <Handle type="source" position={Position.Right} style={{ right: 0 }} />
    </div>
  );
});

DecisionNode.displayName = "DecisionNode";

// Start Node (Green Circle)
const StartNode = memo(({ data }) => {
  return (
    <div className="relative">
      <div className="w-32 h-32 rounded-full bg-green-500 border-4 border-green-700 shadow-2xl flex flex-col items-center justify-center">
        <div className="text-4xl mb-1">🚀</div>
        <div className="font-bold text-white text-sm">START</div>
        <div className="text-xs text-green-100 mt-1 text-center px-2">
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

StartNode.displayName = "StartNode";

// End Node (Red Circle)
const EndNode = memo(({ data }) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} />
      <div className="w-32 h-32 rounded-full bg-red-500 border-4 border-red-700 shadow-2xl flex flex-col items-center justify-center">
        <div className="text-4xl mb-1">🏁</div>
        <div className="font-bold text-white text-sm">END</div>
        <div className="text-xs text-red-100 mt-1 text-center px-2">
          {data.label}
        </div>
      </div>
    </div>
  );
});

EndNode.displayName = "EndNode";

// Input Node (Purple Rectangle for User Input)
const InputNode = memo(({ data }) => {
  return (
    <div className="px-6 py-4 rounded-lg border-3 border-purple-500 bg-purple-50 shadow-lg min-w-[220px]">
      <Handle type="target" position={Position.Top} />

      <div className="text-center">
        <div className="text-3xl mb-2">⌨️</div>
        <div className="font-bold text-lg text-purple-900">{data.label}</div>
        <div className="text-xs text-purple-700 mt-2 italic">
          Customer enters data
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

InputNode.displayName = "InputNode";

const nodeTypes = {
  messageNode: MessageNode,
  stateNode: StateNode,
  decisionNode: DecisionNode,
  startNode: StartNode,
  endNode: EndNode,
  inputNode: InputNode,
  moduleNode: ModuleNode,
};

function ChatbotMessageEditor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModeToggle, setShowModeToggle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Flow visualization state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowData, setFlowData] = useState(null);

  // Module view state
  const [moduleData, setModuleData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleStats, setModuleStats] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showModuleFlowchart, setShowModuleFlowchart] = useState(false);
  const [moduleFlowchartId, setModuleFlowchartId] = useState(null);

  // Message management state
  const [allMessages, setAllMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("flowchart"); // flowchart | list | split | module
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | static | template | dynamic
  const [showSidepanel, setShowSidepanel] = useState(true);

  // Backup management state
  const [backups, setBackups] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [stats, setStats] = useState(null);
  const [showFullscreenTooltip, setShowFullscreenTooltip] = useState(false);

  // Notification state
  const [notification, setNotification] = useState(null);

  /**
   * Load flow data on component mount
   */
  useEffect(() => {
    loadFlowData();
    loadBackups();
    loadChangelog();
    loadStats();
  }, []);

  /**
   * Auto-layout nodes using dagre (hierarchical layout)
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
   * Load complete flow data from backend
   * Backend now sends a complete flowchart with all 500+ messages as nodes
   */
  const loadFlowData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/flow-data`,
      );
      const data = await response.json();

      if (data.success) {
        setFlowData(data);
        setAllMessages(data.messages || []);
        setFilteredMessages(data.messages || []);

        console.log(
          `Received flowchart with ${data.flow.nodes.length} nodes and ${data.flow.edges.length} edges`,
        );

        // Backend sends complete flow - just apply layout and styling
        const flowNodes = data.flow?.nodes || [];
        const flowEdges = data.flow?.edges || [];

        // Enhance edge styling for better visualization
        const styledEdges = flowEdges.map((edge) => {
          const isTransition = edge.edgeType === "transition";
          const isSequential = edge.edgeType === "sequential";

          return {
            ...edge,
            type: "smoothstep",
            animated: isTransition,
            label: edge.label || "",
            labelStyle: {
              fill: isTransition ? "#1e40af" : "#64748b",
              fontWeight: isTransition ? 700 : 600,
              fontSize: isTransition ? 13 : 12,
            },
            labelBgStyle: {
              fill: isTransition ? "#dbeafe" : "#f1f5f9",
              fillOpacity: 0.9,
            },
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4,
            style: {
              stroke:
                edge.style?.stroke || (isTransition ? "#3b82f6" : "#64748b"),
              strokeWidth: edge.style?.strokeWidth || (isTransition ? 3 : 2),
              strokeDasharray: isTransition ? "5,5" : "0",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color:
                edge.style?.stroke || (isTransition ? "#3b82f6" : "#64748b"),
              width: isTransition ? 25 : 20,
              height: isTransition ? 25 : 20,
            },
          };
        });

        // Apply dagre layout to position all nodes properly
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(flowNodes, styledEdges, "TB");

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        console.log(
          `Flowchart ready: ${layoutedNodes.length} messages from start to end`,
        );

        showNotification(
          `Loaded complete flowchart with ${layoutedNodes.length} messages`,
          "success",
        );
      } else {
        showNotification("Failed to load flow data: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error loading flow data:", error);
      showNotification("Error loading flow data", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load backups list
   */
  const loadBackups = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/backups`,
      );
      const data = await response.json();

      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error("Error loading backups:", error);
    }
  };

  /**
   * Load changelog
   */
  const loadChangelog = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/changelog`,
      );
      const data = await response.json();

      if (data.success) {
        setChangelog(data.changes || []);
      }
    } catch (error) {
      console.error("Error loading changelog:", error);
    }
  };

  /**
   * Load statistics
   */
  const loadStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/stats`,
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  /**
   * Load module flow data (18 business logic modules)
   */
  const loadModuleFlowData = async () => {
    try {
      setLoading(true);
      console.log("Loading module flow data...");

      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/module-flow-data`,
      );
      const data = await response.json();

      if (data.success) {
        console.log(
          `Loaded ${data.modules.length} modules with ${data.edges.length} transitions`,
        );

        const moduleNodes = data.modules.map((module) => ({
          id: module.id,
          type: "moduleNode",
          data: {
            ...module.data,
            onViewMessages: (moduleId) => handleViewModuleDetails(moduleId),
            onViewFlowchart: (moduleId) => handleViewModuleFlowchart(moduleId),
          },
          position: { x: 0, y: 0 },
        }));

        const moduleEdges = data.edges;

        // Apply dagre layout
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(moduleNodes, moduleEdges, "TB");

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setModuleData(data);

        showNotification(
          `Loaded ${data.modules.length} modules successfully`,
          "success",
        );
      } else {
        showNotification("Failed to load module data: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error loading module data:", error);
      showNotification("Error loading module data", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load module statistics
   */
  const loadModuleStatistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/module-statistics`,
      );
      const data = await response.json();

      if (data.success) {
        setModuleStats(data);
      }
    } catch (error) {
      console.error("Error loading module statistics:", error);
    }
  };

  /**
   * Handle viewing module details
   */
  const handleViewModuleDetails = async (moduleId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/module/${moduleId}/details`,
      );
      const data = await response.json();

      if (data.success) {
        setSelectedModule(data.module);
        setShowModuleModal(true);
      } else {
        showNotification("Failed to load module details", "error");
      }
    } catch (error) {
      console.error("Error loading module details:", error);
      showNotification("Error loading module details", "error");
    }
  };

  /**
   * Handle viewing module flowchart
   */
  const handleViewModuleFlowchart = (moduleId) => {
    setModuleFlowchartId(moduleId);
    setShowModuleFlowchart(true);
  };

  /**
   * Handle back from module flowchart
   */
  const handleBackFromModuleFlowchart = () => {
    setShowModuleFlowchart(false);
    setModuleFlowchartId(null);
  };

  /**
   * Load appropriate data based on view mode
   */
  useEffect(() => {
    if (viewMode === "module") {
      loadModuleFlowData();
      loadModuleStatistics();
    } else if (viewMode === "flowchart" || viewMode === "split") {
      if (nodes.length === 0) {
        loadFlowData();
      }
    }
  }, [viewMode]);

  /**
   * Create manual backup
   */
  const createBackup = async () => {
    try {
      const reason = prompt("Enter reason for backup (optional):");

      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/backup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reason || "Manual backup",
            editor: "Admin",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showNotification("Backup created successfully", "success");
        loadBackups();
      } else {
        showNotification("Failed to create backup: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      showNotification("Error creating backup", "error");
    }
  };

  /**
   * Restore from backup
   */
  const restoreBackup = async (backupFile) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to restore from ${backupFile}? This will overwrite current messages.`,
      );

      if (!confirmed) return;

      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/restore/${backupFile}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            editor: "Admin",
            reason: "Manual restore",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showNotification("Backup restored successfully", "success");
        loadFlowData();
        loadChangelog();
      } else {
        showNotification("Failed to restore backup: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      showNotification("Error restoring backup", "error");
    }
  };

  /**
   * Start editing a message
   */
  const startEditing = (message) => {
    if (!message.editable) {
      showNotification(
        "This message is dynamic and cannot be edited",
        "warning",
      );
      return;
    }

    setEditingMessage(message);
    setEditContent(message.content);
  };

  /**
   * Save edited message
   */
  const saveMessage = async () => {
    if (!editingMessage) return;

    // Security PIN check
    const enteredPin = prompt("🔒 Enter security PIN to save message:");

    if (enteredPin === null) {
      // User clicked cancel
      return;
    }

    if (enteredPin !== "1234") {
      showNotification(
        "❌ You entered wrong PIN. Message could not be saved.",
        "error",
      );
      return;
    }

    try {
      setSaving(true);

      // Validate content
      const validateResponse = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: editContent,
            type: editingMessage.type,
          }),
        },
      );

      const validateData = await validateResponse.json();

      if (!validateData.valid) {
        showNotification(
          "Validation errors: " + validateData.errors.join(", "),
          "error",
        );
        return;
      }

      if (validateData.warnings.length > 0) {
        const proceed = window.confirm(
          "Warnings:\n" + validateData.warnings.join("\n") + "\n\nContinue?",
        );
        if (!proceed) return;
      }

      // Update message
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-messages/${editingMessage.lineNumber}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newContent: editContent,
            editor: "Admin",
            reason: "Manual edit from UI",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showNotification("Message updated successfully", "success");
        setEditingMessage(null);
        setEditContent("");
        loadFlowData();
        loadChangelog();
        loadStats();
      } else {
        showNotification("Failed to update message: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error saving message:", error);
      showNotification("Error saving message", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  /**
   * Filter messages
   */
  useEffect(() => {
    let filtered = allMessages;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((m) => m.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.context?.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.function?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredMessages(filtered);
  }, [searchTerm, filterType, allMessages]);

  /**
   * Handle node click in flowchart
   */
  const onNodeClick = useCallback((event, node) => {
    setSelectedMessage(node.data);
  }, []);

  /**
   * Handle edge connection
   */
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  /**
   * Show notification
   */
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  /**
   * Get color for message type
   */
  const getMessageTypeColor = (type) => {
    switch (type) {
      case "static":
        return "text-green-600 bg-green-50 border-green-200";
      case "template":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "dynamic":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  /**
   * Get icon for message type
   */
  const getMessageTypeIcon = (type) => {
    switch (type) {
      case "static":
        return <CheckCircle className="w-4 h-4" />;
      case "template":
        return <Code className="w-4 h-4" />;
      case "dynamic":
        return <Database className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {!isFullscreen && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                117. Chatbot Message Editor
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualize and edit all chatbot conversation messages with
                flowchart
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Fullscreen Toggle */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsFullscreen(!isFullscreen);
                    if (!isFullscreen) {
                      setSidebarOpen(false);
                    }
                    setShowFullscreenTooltip(false);
                  }}
                  onMouseEnter={() => setShowFullscreenTooltip(true)}
                  onMouseLeave={() => setShowFullscreenTooltip(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                {showFullscreenTooltip && !isFullscreen && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm font-medium">
                      💡 Press this for full screen view!
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode Toggle Buttons */}
              <button
                onClick={() => setShowModeToggle(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Advanced
              </button>

              <button
                onClick={() => setShowModeToggle(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                AI Mode
              </button>

              <button
                onClick={createBackup}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Backup
              </button>

              <button
                onClick={loadFlowData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-5 gap-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="text-sm text-blue-600 font-medium">
                  Total Messages
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {stats.totalMessages}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="text-sm text-green-600 font-medium">
                  Editable
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {stats.editableMessages}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <div className="text-sm text-yellow-600 font-medium">
                  Templates
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  {stats.templateMessages}
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <div className="text-sm text-red-600 font-medium">Dynamic</div>
                <div className="text-2xl font-bold text-red-900">
                  {stats.dynamicMessages}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                <div className="text-sm text-purple-600 font-medium">
                  States
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {stats.states || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
            <div
              className={`px-6 py-4 rounded-lg shadow-2xl border-2 flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-600 text-white border-green-700"
                  : notification.type === "error"
                    ? "bg-red-600 text-white border-red-700"
                    : notification.type === "warning"
                      ? "bg-yellow-600 text-white border-yellow-700"
                      : "bg-blue-600 text-white border-blue-700"
              }`}
            >
              {notification.type === "success" && (
                <CheckCircle className="w-6 h-6" />
              )}
              {notification.type === "error" && (
                <AlertCircle className="w-6 h-6" />
              )}
              {notification.type === "warning" && (
                <AlertCircle className="w-6 h-6" />
              )}
              {notification.type === "info" && (
                <MessageSquare className="w-6 h-6" />
              )}
              <span className="font-medium text-lg">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* View Mode Selector */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("flowchart")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "flowchart"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FileCode className="w-4 h-4 inline mr-2" />
                Flowchart
              </button>
              <button
                onClick={() => setViewMode("module")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "module"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📦 Modules
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "split"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Split View
              </button>

              {/* Message Count Badge */}
              <div className="ml-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border-2 border-blue-300">
                <span className="font-bold">{filteredMessages.length}</span>
                <span className="text-sm ml-1">
                  of {allMessages.length} messages
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="static">Static Only</option>
                <option value="template">Templates Only</option>
                <option value="dynamic">Dynamic Only</option>
              </select>

              <button
                onClick={() => setShowSidepanel(!showSidepanel)}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {showSidepanel ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Flowchart or List View */}
          <div
            className={`${showSidepanel ? "w-2/3" : "w-full"} border-r border-gray-200 overflow-hidden`}
          >
            {viewMode === "flowchart" || viewMode === "split" ? (
              <div className="h-full bg-gray-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                  >
                    <Controls />
                    <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    <Background variant="dots" gap={12} size={1} />
                    <Panel
                      position="top-left"
                      className="bg-white rounded-lg shadow-lg p-4"
                    >
                      <div className="text-sm">
                        <div className="font-bold text-lg mb-3">🗺️ Legend</div>

                        <div className="mb-4">
                          <div className="font-semibold mb-2 text-gray-700">
                            Message Types:
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
                              <span className="font-medium">Static</span>
                              <span className="text-xs text-gray-600">
                                (Editable)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-600"></div>
                              <span className="font-medium">Template</span>
                              <span className="text-xs text-gray-600">
                                (Editable)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
                              <span className="font-medium">Dynamic</span>
                              <span className="text-xs text-gray-600">
                                (Read-only)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-xl bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                                <span className="text-xs">🔵</span>
                              </div>
                              <span className="font-medium">State</span>
                              <span className="text-xs text-gray-600">
                                (Conversation)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 pb-3 border-t border-gray-200 pt-3">
                          <div className="font-semibold mb-2 text-gray-700">
                            Connections:
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-0.5 bg-blue-500"></div>
                              <span className="text-xs">State transition</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-0.5 bg-gray-500"></div>
                              <span className="text-xs">Sequential flow</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-0.5 border-t-2 border-dashed border-blue-500"></div>
                              <span className="text-xs">User choice</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200 text-xs text-gray-600">
                          <div>
                            💡 <strong>Tip:</strong> Click to select
                          </div>
                          <div className="mt-1">
                            🖱️ Drag to pan, scroll to zoom
                          </div>
                          <div className="mt-1">
                            🔍 Follow edges to see customer journey
                          </div>
                        </div>
                      </div>
                    </Panel>
                  </ReactFlow>
                )}
              </div>
            ) : null}

            {/* Module View */}
            {viewMode === "module" && !showModuleFlowchart && (
              <div className="h-full bg-gray-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
                  >
                    <Controls />
                    <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    <Background variant="dots" gap={12} size={1} />
                    <Panel
                      position="top-left"
                      className="bg-white rounded-lg shadow-lg p-4 max-w-xs"
                    >
                      <div className="text-sm">
                        <div className="font-bold text-lg mb-3">
                          📦 Module View
                        </div>

                        {moduleStats && (
                          <div className="space-y-2 mb-4 pb-3 border-b border-gray-200">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Modules:
                              </span>
                              <span className="font-bold">
                                {moduleStats.statistics.totalModules}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Messages:
                              </span>
                              <span className="font-bold">
                                {moduleStats.statistics.totalMessages}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Avg per Module:
                              </span>
                              <span className="font-bold">
                                {moduleStats.statistics.avgMessagesPerModule}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            💡 <strong>Click</strong> module header to expand
                          </div>
                          <div>
                            📋 <strong>View Messages</strong> to see all
                            messages
                          </div>
                          <div>
                            📊 <strong>View Flowchart</strong> to see module
                            flow
                          </div>
                          <div>
                            🔍 <strong>Follow edges</strong> to see transitions
                          </div>
                        </div>
                      </div>
                    </Panel>
                  </ReactFlow>
                )}
              </div>
            )}

            {/* Individual Module Flowchart View */}
            {viewMode === "module" &&
              showModuleFlowchart &&
              moduleFlowchartId !== null && (
                <ModuleFlowchart
                  moduleId={moduleFlowchartId}
                  moduleName={
                    moduleData?.modules.find(
                      (m) => m.data.moduleId === moduleFlowchartId,
                    )?.data.name || `Module ${moduleFlowchartId}`
                  }
                  moduleIcon={
                    moduleData?.modules.find(
                      (m) => m.data.moduleId === moduleFlowchartId,
                    )?.data.icon || "📦"
                  }
                  moduleColor={
                    moduleData?.modules.find(
                      (m) => m.data.moduleId === moduleFlowchartId,
                    )?.data.color || "#6366f1"
                  }
                  onBack={handleBackFromModuleFlowchart}
                />
              )}

            {(viewMode === "list" || viewMode === "split") && (
              <div className="h-full overflow-y-auto bg-white p-4">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No messages found</p>
                    <p className="text-sm mt-2">
                      Try adjusting your search or filter
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all ${getMessageTypeColor(
                          message.type,
                        )}`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl">
                              {message.type === "static" && "✅"}
                              {message.type === "template" && "⚠️"}
                              {message.type === "dynamic" && "❌"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-xs bg-white px-3 py-1 rounded-full border border-gray-300 font-semibold">
                                  Line {message.lineNumber}
                                </span>
                                <span className="text-xs font-medium bg-white px-3 py-1 rounded-full border border-gray-300">
                                  {message.function}
                                </span>
                                {message.context?.state && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium border border-blue-300">
                                    State: {message.context.state}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-medium leading-relaxed">
                                {message.content.length > 150
                                  ? message.content.substring(0, 150) + "..."
                                  : message.content}
                              </div>
                              {message.hasVariables && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-yellow-700">
                                  <Code className="w-3 h-3" />
                                  <span>
                                    Contains {message.variables.length}{" "}
                                    variable(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {message.editable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(message);
                              }}
                              className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
                              title="Edit message"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Side Panel */}
          {showSidepanel && (
            <div className="w-1/3 bg-white overflow-y-auto flex-shrink-0">
              {/* Message Details / Editor */}
              {editingMessage ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-4 border-b">
                    <h3 className="text-lg font-bold">Edit Message</h3>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Close editor"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Line Number ( This is where the message is located in
                        the code )
                      </label>
                      <div className="text-sm bg-gray-100 px-3 py-2 rounded">
                        {editingMessage.lineNumber}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Function
                      </label>
                      <div className="text-sm bg-gray-100 px-3 py-2 rounded">
                        {editingMessage.function}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm ${getMessageTypeColor(
                          editingMessage.type,
                        )}`}
                      >
                        {getMessageTypeIcon(editingMessage.type)}
                        {editingMessage.type}
                      </div>
                    </div>

                    {editingMessage.hasVariables && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <strong>Warning:</strong> This message contains
                            variables: {editingMessage.variables.join(", ")}
                            <br />
                            Keep the variable syntax intact: ${"{variable}"}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Content
                      </label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={8}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {editContent.length} / 4096 characters
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveMessage}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedMessage ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Message Details</h3>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Line Number( This is where the message is located in the
                        code )
                      </label>
                      <div className="text-sm bg-gray-100 px-3 py-2 rounded font-mono">
                        {selectedMessage.lineNumber}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Function
                      </label>
                      <div className="text-sm bg-gray-100 px-3 py-2 rounded">
                        {selectedMessage.function}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm ${getMessageTypeColor(
                          selectedMessage.type,
                        )}`}
                      >
                        {getMessageTypeIcon(selectedMessage.type)}
                        {selectedMessage.type}
                      </div>
                    </div>

                    {selectedMessage.context?.state && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conversation State
                        </label>
                        <div className="text-sm bg-gray-100 px-3 py-2 rounded">
                          {selectedMessage.context.state}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <div className="text-sm bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap">
                        {selectedMessage.content}
                      </div>
                    </div>

                    {selectedMessage.hasVariables && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variables
                        </label>
                        <div className="space-y-1">
                          {selectedMessage.variables.map((v, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-blue-50 px-3 py-2 rounded font-mono"
                            >
                              {v}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMessage.editable && (
                      <button
                        onClick={() => startEditing(selectedMessage)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Message
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4">Recent Changes</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {changelog.slice(0, 10).map((change, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-xs text-gray-500">
                                {new Date(change.timestamp).toLocaleString()}
                              </div>
                              <div className="text-sm font-medium">
                                {change.action}
                              </div>
                              {change.reason && (
                                <div className="text-xs text-gray-600">
                                  {change.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4">Backups</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {backups.slice(0, 5).map((backup, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium font-mono">
                                {backup.fileName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(backup.created).toLocaleString()}
                              </div>
                            </div>
                            <button
                              onClick={() => restoreBackup(backup.fileName)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Upload className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Module Detail Modal */}
      {showModuleModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div
              className="p-6 border-b border-gray-200"
              style={{
                backgroundColor: `${selectedModule.color}15`,
                borderBottom: `3px solid ${selectedModule.color}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedModule.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedModule.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedModule.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModuleModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Module Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">
                    {selectedModule.messageCount}
                  </div>
                  <div className="text-xs text-blue-700">Messages</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-900">
                    {selectedModule.states?.length || 0}
                  </div>
                  <div className="text-xs text-green-700">States</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-900">
                    {selectedModule.entryPoints?.length || 0}
                  </div>
                  <div className="text-xs text-purple-700">Entry Points</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-900">
                    {selectedModule.exitPoints?.length || 0}
                  </div>
                  <div className="text-xs text-orange-700">Exit Points</div>
                </div>
              </div>

              {/* Health Status */}
              {selectedModule.health && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Health Status
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedModule.health.health === "good"
                          ? "bg-green-100 text-green-800"
                          : selectedModule.health.health === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedModule.health.health.toUpperCase()} (Score:{" "}
                      {selectedModule.health.score}/100)
                    </span>
                  </div>
                  {selectedModule.health.issues &&
                    selectedModule.health.issues.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {selectedModule.health.issues.map((issue, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-gray-600 flex items-start gap-2"
                          >
                            <span>⚠️</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {/* Messages List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  All Messages ({selectedModule.messageCount})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedModule.messages?.map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          L{msg.line}
                        </span>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            {msg.function} {msg.state && `• ${msg.state}`}
                          </div>
                          <div className="text-sm text-gray-900">
                            {msg.content.length > 150
                              ? msg.content.substring(0, 150) + "..."
                              : msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowModuleModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewMode("flowchart");
                  setShowModuleModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View in Flowchart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Toggle Modal */}
      {showModeToggle && (
        <ModeToggle
          componentName="Chatbot Message Editor"
          onClose={() => setShowModeToggle(false)}
        />
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ChatbotMessageEditor;
