import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Home } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const BALI_STATES = [
  "BULELENG",
  "JEMBRANA",
  "TABANAN",
  "BADUNG",
  "DENPASAR",
  "GIANYAR",
  "BANGLI",
  "KARANGASEM",
  "KLUNGKUNG",
  "NUSA PENIDA",
];

const AreasManagement = () => {
  const [areas, setAreas] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newArea, setNewArea] = useState({
    state: "",
    area: "",
    displayName: "",
    truckPrice: 0,
    scooterPrice: 0,
  });

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/areas"
      );

      if (response.ok) {
        const areasData = await response.json();
        setAreas(areasData);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddArea = async () => {
    if (!newArea.state || !newArea.area || !newArea.displayName) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/areas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newArea,
            isActive: true,
          }),
        }
      );

      if (response.ok) {
        const addedArea = await response.json();
        setAreas((prevAreas) => [...prevAreas, addedArea]);
        setNewArea({
          state: "",
          area: "",
          displayName: "",
          truckPrice: 0,
          scooterPrice: 0,
        });
        setIsAddingNew(false);
        alert("Area added successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to add area: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding area:", error);
      alert("Error adding area");
    }
  };

  const handleUpdateArea = async (id, updatedData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/areas/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        const updatedArea = await response.json();
        setAreas((prevAreas) =>
          prevAreas.map((area) => (area._id === id ? updatedArea : area))
        );
        setEditingId(null);
        alert("Area updated successfully!");
      }
    } catch (error) {
      console.error("Error updating area:", error);
      alert("Error updating area");
    }
  };

  const handleDeleteArea = async (id) => {
    if (!window.confirm("Are you sure you want to delete this area?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/areas/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setAreas((prevAreas) => prevAreas.filter((area) => area._id !== id));
        alert("Area deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      alert("Error deleting area");
    }
  };

  const toggleAreaStatus = async (id) => {
    const area = areas.find((a) => a._id === id);
    await handleUpdateArea(id, { isActive: !area.isActive });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-80" : ""
          } w-full bg-gray-50 p-4`}
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group areas by state
  const groupedAreas = areas.reduce((acc, area) => {
    if (!acc[area.state]) {
      acc[area.state] = [];
    }
    acc[area.state].push(area);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-4`}
      >
        <div className="bg-purple-900 text-white p-4 flex items-center">
          <Home className="mr-2" size={20} />
          <h1 className="text-xl font-semibold">Areas Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Delivery Areas ({areas.length})
            </h2>
            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Area
            </button>
          </div>

          {isAddingNew && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Add New Area</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={newArea.state}
                    onChange={(e) =>
                      setNewArea({ ...newArea, state: e.target.value })
                    }
                  >
                    <option value="">Select a state</option>
                    {BALI_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rawalpindi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={newArea.area}
                    onChange={(e) =>
                      setNewArea({ ...newArea, area: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rawalpindi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={newArea.displayName}
                    onChange={(e) =>
                      setNewArea({ ...newArea, displayName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Truck Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Truck delivery price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={newArea.truckPrice}
                    onChange={(e) =>
                      setNewArea({
                        ...newArea,
                        truckPrice: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scooter Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Scooter delivery price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={newArea.scooterPrice}
                    onChange={(e) =>
                      setNewArea({
                        ...newArea,
                        scooterPrice: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddArea}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Area
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewArea({
                      state: "",
                      area: "",
                      displayName: "",
                      truckPrice: 0,
                      scooterPrice: 0,
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {Object.keys(groupedAreas).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No areas found. Add your first area to get started!
              </p>
            </div>
          ) : (
            Object.keys(groupedAreas)
              .sort()
              .map((state) => (
                <div key={state} className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-900">
                    📍 {state}
                  </h3>
                  <div className="space-y-4">
                    {groupedAreas[state].map((area) => (
                      <AreaCard
                        key={area._id}
                        area={area}
                        isEditing={editingId === area._id}
                        onEdit={() => setEditingId(area._id)}
                        onSave={(updatedData) =>
                          handleUpdateArea(area._id, updatedData)
                        }
                        onCancel={() => setEditingId(null)}
                        onDelete={() => handleDeleteArea(area._id)}
                        onToggleStatus={() => toggleAreaStatus(area._id)}
                        formatRupiah={formatRupiah}
                      />
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

const AreaCard = ({
  area,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleStatus,
  formatRupiah,
}) => {
  const [editData, setEditData] = useState(area);

  useEffect(() => {
    setEditData(area);
  }, [area]);

  const handleSave = () => {
    if (!editData.state || !editData.area || !editData.displayName) {
      alert("Please fill in required fields");
      return;
    }
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={editData.state}
            onChange={(e) =>
              setEditData({ ...editData, state: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a state</option>
            {BALI_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={editData.area}
            onChange={(e) => setEditData({ ...editData, area: e.target.value })}
            placeholder="Area"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={editData.displayName}
            onChange={(e) =>
              setEditData({ ...editData, displayName: e.target.value })
            }
            placeholder="Display Name"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            value={editData.truckPrice}
            onChange={(e) =>
              setEditData({
                ...editData,
                truckPrice: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Truck Price"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            value={editData.scooterPrice}
            onChange={(e) =>
              setEditData({
                ...editData,
                scooterPrice: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Scooter Price"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 ${
        !area.isActive ? "bg-gray-100 opacity-75" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {area.state} - {area.displayName}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                area.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {area.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Area code: {area.area}</p>
          <p className="text-sm text-gray-600 mb-1">
            Truck price:{" "}
            <span className="font-medium">{formatRupiah(area.truckPrice)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Scooter price:{" "}
            <span className="font-medium">
              {formatRupiah(area.scooterPrice)}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleStatus}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              area.isActive
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {area.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreasManagement;
