import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import { MapPin, Plus, Trash2, ChevronRight } from "lucide-react";

const API_BASE = "http://localhost:5000/api/area-management";

const AreaManagementB = () => {
  // Data states
  const [islands, setIslands] = useState([]);
  const [largerStates, setLargerStates] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [areas, setAreas] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  
  // Selection states
  const [selectedIsland, setSelectedIsland] = useState("");
  const [selectedLargerState, setSelectedLargerState] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  
  // New entry states
  const [newIsland, setNewIsland] = useState("");
  const [newLargerState, setNewLargerState] = useState("");
  const [newRegency, setNewRegency] = useState("");
  const [newArea, setNewArea] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  // Mode states (existing vs new)
  const [islandMode, setIslandMode] = useState("existing");
  const [stateMode, setStateMode] = useState("existing");
  const [regencyMode, setRegencyMode] = useState("existing");
  const [areaMode, setAreaMode] = useState("existing");
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = React.useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetchIslands();
    fetchAllAreas();
  }, []);

  // Fetch larger states when island changes
  useEffect(() => {
    if (selectedIsland) {
      fetchLargerStates(selectedIsland);
    } else {
      setLargerStates([]);
    }
    setSelectedLargerState("");
    setSelectedRegency("");
    setSelectedArea("");
  }, [selectedIsland]);

  // Fetch regencies when larger state changes
  useEffect(() => {
    if (selectedLargerState) {
      fetchRegencies(selectedLargerState);
    } else {
      setRegencies([]);
    }
    setSelectedRegency("");
    setSelectedArea("");
  }, [selectedLargerState]);

  // Fetch areas when regency changes
  useEffect(() => {
    if (selectedRegency) {
      fetchAreas(selectedRegency);
    } else {
      setAreas([]);
    }
    setSelectedArea("");
  }, [selectedRegency]);

  const fetchIslands = async () => {
    try {
      const res = await axios.get(`${API_BASE}/islands`);
      setIslands(res.data);
    } catch (error) {
      console.error("Error fetching islands:", error);
    }
  };

  const fetchLargerStates = async (islandId) => {
    try {
      const res = await axios.get(`${API_BASE}/larger-states?islandId=${islandId}`);
      setLargerStates(res.data);
    } catch (error) {
      console.error("Error fetching larger states:", error);
    }
  };

  const fetchRegencies = async (largerStateId) => {
    try {
      const res = await axios.get(`${API_BASE}/regencies?largerStateId=${largerStateId}`);
      setRegencies(res.data);
    } catch (error) {
      console.error("Error fetching regencies:", error);
    }
  };

  const fetchAreas = async (regencyId) => {
    try {
      const res = await axios.get(`${API_BASE}/areas?regencyId=${regencyId}`);
      setAreas(res.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchAllAreas = async () => {
    try {
      const res = await axios.get(`${API_BASE}/full-hierarchy`);
      setAllAreas(res.data);
    } catch (error) {
      console.error("Error fetching all areas:", error);
    }
  };

  // Handle Excel upload
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      // Use full URL or axios instance if configured, here using axis directly
      const response = await axios.post(`${API_BASE}/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUploadResult(response.data);
        fetchAllAreas(); // Refresh list
        // Also refresh dropdowns if needed
        fetchIslands();
      } else {
        alert(response.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Error uploading Excel:", err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddArea = async () => {
    setLoading(true);
    try {
      let islandId = selectedIsland;
      let largerStateId = selectedLargerState;
      let regencyId = selectedRegency;
      let areaName = areaMode === "new" ? newArea : null;

      // Create new island if needed
      if (islandMode === "new" && newIsland) {
        const res = await axios.post(`${API_BASE}/islands`, { name: newIsland });
        islandId = res.data._id;
        // Immediately refresh islands dropdown and select the new one
        await fetchIslands();
        setSelectedIsland(islandId);
      }

      // Create new larger state if needed
      if (stateMode === "new" && newLargerState && islandId) {
        const res = await axios.post(`${API_BASE}/larger-states`, { 
          name: newLargerState, 
          islandId 
        });
        largerStateId = res.data._id;
        // Immediately refresh larger states dropdown
        await fetchLargerStates(islandId);
        setSelectedLargerState(largerStateId);
      }

      // Create new regency if needed
      if (regencyMode === "new" && newRegency && largerStateId) {
        const res = await axios.post(`${API_BASE}/regencies`, { 
          name: newRegency, 
          largerStateId 
        });
        regencyId = res.data._id;
        // Immediately refresh regencies dropdown
        await fetchRegencies(largerStateId);
        setSelectedRegency(regencyId);
      }

      // Create new area
      if (areaMode === "new" && areaName && regencyId) {
        await axios.post(`${API_BASE}/areas`, { 
          name: areaName, 
          displayName: displayName,
          regencyId 
        });
        // Immediately refresh areas dropdown
        await fetchAreas(regencyId);
        alert("Area created successfully!");
      } else if (areaMode === "existing" && selectedArea) {
        alert("Area already exists!");
      } else if (!areaName && areaMode === "new") {
        alert("Please enter an area name");
        setLoading(false);
        return;
      }

      // Reset new input fields but keep selections
      setNewIsland("");
      setNewLargerState("");
      setNewRegency("");
      setNewArea("");
      setDisplayName("");
      setIslandMode("existing");
      setStateMode("existing");
      setRegencyMode("existing");
      setAreaMode("existing");
      
      // Refresh the table
      await fetchAllAreas();
    } catch (error) {
      console.error("Error adding area:", error);
      alert(error.response?.data?.message || "Error adding area");
    }
    setLoading(false);
  };

  const handleDeleteArea = async (areaId) => {
    if (!window.confirm("Are you sure you want to delete this area?")) return;
    
    try {
      await axios.delete(`${API_BASE}/areas/${areaId}`);
      fetchAllAreas();
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-green-700 text-white p-4 rounded-lg mb-6 shadow-md flex justify-between items-start">
            <div className="flex items-center gap-3">
              <MapPin size={28} />
              <h1 className="text-2xl font-bold">113. Area Management B</h1>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleExcelUpload}
              />
              <button
                className={`bg-white text-green-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-75 ${uploading ? 'cursor-not-allowed' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "⏳ Uploading..." : "📤 Upload Excel"}
              </button>
            </div>
          </div>

          {/* Upload Result Modal */}
          {uploadResult && (
            <div className="bg-green-100 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <strong className="text-green-900">✅ {uploadResult.message}</strong>
                <button
                  className="text-green-900 hover:text-green-700 text-xl font-bold"
                  onClick={() => setUploadResult(null)}
                >
                  ×
                </button>
              </div>
              <div className="text-sm">
                <strong>Import Summary:</strong>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>🏝️ Islands: {uploadResult.stats.islands.created} new</div>
                  <div>📍 States: {uploadResult.stats.states.created} new</div>
                  <div>🏘️ Regencies: {uploadResult.stats.regencies.created} new</div>
                  <div>📌 Areas: {uploadResult.stats.areas.created} created, {uploadResult.stats.areas.updated} updated</div>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Area</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Island */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Island *
                </label>
                <div className="space-y-2">
                  <select
                    value={islandMode}
                    onChange={(e) => setIslandMode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="existing">Select Existing</option>
                    <option value="new">Add New</option>
                  </select>
                  
                  {islandMode === "existing" ? (
                    <select
                      value={selectedIsland}
                      onChange={(e) => setSelectedIsland(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Island...</option>
                      {islands.map(i => (
                        <option key={i._id} value={i._id}>{i.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newIsland}
                      onChange={(e) => setNewIsland(e.target.value)}
                      placeholder="Enter new island name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              </div>

              {/* Larger State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Larger State *
                </label>
                <div className="space-y-2">
                  <select
                    value={stateMode}
                    onChange={(e) => setStateMode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="existing">Select Existing</option>
                    <option value="new">Add New</option>
                  </select>
                  
                  {stateMode === "existing" ? (
                    <select
                      value={selectedLargerState}
                      onChange={(e) => setSelectedLargerState(e.target.value)}
                      disabled={!selectedIsland && islandMode === "existing"}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Larger State...</option>
                      {largerStates.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newLargerState}
                      onChange={(e) => setNewLargerState(e.target.value)}
                      placeholder="Enter new larger state"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              </div>

              {/* Regency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Regency *
                </label>
                <div className="space-y-2">
                  <select
                    value={regencyMode}
                    onChange={(e) => setRegencyMode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="existing">Select Existing</option>
                    <option value="new">Add New</option>
                  </select>
                  
                  {regencyMode === "existing" ? (
                    <select
                      value={selectedRegency}
                      onChange={(e) => setSelectedRegency(e.target.value)}
                      disabled={!selectedLargerState && stateMode === "existing"}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Regency...</option>
                      {regencies.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newRegency}
                      onChange={(e) => setNewRegency(e.target.value)}
                      placeholder="Enter new regency"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4. Area *
                </label>
                <div className="space-y-2">
                  <select
                    value={areaMode}
                    onChange={(e) => setAreaMode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="existing">Select Existing</option>
                    <option value="new">Add New</option>
                  </select>
                  
                  {areaMode === "existing" ? (
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      disabled={!selectedRegency && regencyMode === "existing"}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Area...</option>
                      {areas.map(a => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="Enter new area name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  5. Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Add Button */}
            <div className="mt-6">
              <button
                onClick={handleAddArea}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={20} />
                {loading ? "Adding..." : "Add Area"}
              </button>
            </div>
          </div>

          {/* Areas Table */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">All Areas ({allAreas.length})</h2>
            
            {allAreas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Island</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Larger State</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Regency</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Area</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Display Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAreas.map((area) => (
                      <tr key={area._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {area.regencyId?.largerStateId?.islandId?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                            {area.regencyId?.largerStateId?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            {area.regencyId?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700">{area.name}</td>
                        <td className="px-4 py-3 text-gray-600">{area.displayName || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(area.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteArea(area._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No areas created yet. Use the form above to add new areas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaManagementB;
