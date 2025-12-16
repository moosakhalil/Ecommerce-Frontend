import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import { Search, Plus, Trash2, Building2, MapPin, Phone, Image } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const Competitors = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  
  // Form state for creating new competitor
  const [formData, setFormData] = useState({
    competitorId: "",
    name: "",
    googleMapsLocation: "",
    phoneNumber: "",
    shopSize: "small",
    geo1: "",
    geo2: "",
    geo3: "",
    geo4: "",
    displayName: ""
  });
  
  // File states for photos
  const [photos, setPhotos] = useState({
    photoLocation: null,
    photoShopFar: null,
    photoShopClose: null,
    photoStreetLeft: null,
    photoStreetRight: null
  });
  
  // Product search state
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPrice, setProductPrice] = useState("");
  const [productDate, setProductDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Competitor search state
  const [competitorSearch, setCompetitorSearch] = useState("");
  
  // Area Management B cascading dropdowns
  const [islands, setIslands] = useState([]);
  const [largerStates, setLargerStates] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedIsland, setSelectedIsland] = useState("");
  const [selectedLargerState, setSelectedLargerState] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedGeoArea, setSelectedGeoArea] = useState("");

  // Generate ID on mount and fetch initial data
  useEffect(() => {
    generateNewId();
    fetchCompetitors();
    fetchIslands();
  }, []);
  
  // Cascade: when island changes, fetch larger states
  useEffect(() => {
    if (selectedIsland) {
      fetchLargerStates(selectedIsland);
    } else {
      setLargerStates([]);
    }
    setSelectedLargerState("");
    setSelectedRegency("");
    setSelectedGeoArea("");
    setFormData(prev => ({ ...prev, geo1: selectedIsland, geo2: "", geo3: "", geo4: "" }));
  }, [selectedIsland]);
  
  // Cascade: when larger state changes, fetch regencies
  useEffect(() => {
    if (selectedLargerState) {
      fetchRegencies(selectedLargerState);
    } else {
      setRegencies([]);
    }
    setSelectedRegency("");
    setSelectedGeoArea("");
    setFormData(prev => ({ ...prev, geo2: selectedLargerState, geo3: "", geo4: "" }));
  }, [selectedLargerState]);
  
  // Cascade: when regency changes, fetch areas
  useEffect(() => {
    if (selectedRegency) {
      fetchGeoAreas(selectedRegency);
    } else {
      setAreas([]);
    }
    setSelectedGeoArea("");
    setFormData(prev => ({ ...prev, geo3: selectedRegency, geo4: "" }));
  }, [selectedRegency]);
  
  // When area changes, update formData including displayName from selected area
  useEffect(() => {
    const selectedAreaData = areas.find(a => a._id === selectedGeoArea);
    setFormData(prev => ({ 
      ...prev, 
      geo4: selectedGeoArea,
      displayName: selectedAreaData?.displayName || ""
    }));
  }, [selectedGeoArea, areas]);
  
  const fetchIslands = async () => {
    try {
      const res = await axios.get(`${API_BASE}/area-management/islands`);
      setIslands(res.data);
    } catch (error) {
      console.error("Error fetching islands:", error);
    }
  };
  
  const fetchLargerStates = async (islandId) => {
    try {
      const res = await axios.get(`${API_BASE}/area-management/larger-states?islandId=${islandId}`);
      setLargerStates(res.data);
    } catch (error) {
      console.error("Error fetching larger states:", error);
    }
  };
  
  const fetchRegencies = async (largerStateId) => {
    try {
      const res = await axios.get(`${API_BASE}/area-management/regencies?largerStateId=${largerStateId}`);
      setRegencies(res.data);
    } catch (error) {
      console.error("Error fetching regencies:", error);
    }
  };
  
  const fetchGeoAreas = async (regencyId) => {
    try {
      const res = await axios.get(`${API_BASE}/area-management/areas?regencyId=${regencyId}`);
      setAreas(res.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const generateNewId = async () => {
    try {
      const response = await axios.get(`${API_BASE}/competitors/generate-id`);
      setFormData(prev => ({ ...prev, competitorId: response.data.competitorId }));
    } catch (error) {
      console.error("Error generating ID:", error);
    }
  };

  const fetchCompetitors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/competitors`);
      setCompetitors(response.data);
    } catch (error) {
      console.error("Error fetching competitors:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setPhotos(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!formData.name || !formData.googleMapsLocation || !formData.phoneNumber || 
        !selectedIsland || !selectedLargerState || !selectedRegency || !selectedGeoArea) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Validate all photos are uploaded
    if (!photos.photoLocation || !photos.photoShopFar || !photos.photoShopClose || 
        !photos.photoStreetLeft || !photos.photoStreetRight) {
      alert("Please upload all required photos");
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add photos
      Object.keys(photos).forEach(key => {
        if (photos[key]) {
          formDataToSend.append(key, photos[key]);
        }
      });

      await axios.post(`${API_BASE}/competitors`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Competitor created successfully!");
      
      // Reset form
      setFormData({
        competitorId: "",
        name: "",
        googleMapsLocation: "",
        phoneNumber: "",
        shopSize: "small",
        geo1: "",
        geo2: "",
        geo3: "",
        geo4: "",
        displayName: ""
      });
      setPhotos({
        photoLocation: null,
        photoShopFar: null,
        photoShopClose: null,
        photoStreetLeft: null,
        photoStreetRight: null
      });
      
      // Reset geo selections
      setSelectedIsland("");
      setSelectedLargerState("");
      setSelectedRegency("");
      setSelectedGeoArea("");
      
      generateNewId();
      fetchCompetitors();
    } catch (error) {
      console.error("Error creating competitor:", error);
      alert("Error creating competitor");
    }
    setLoading(false);
  };

  const handleSelectCompetitor = async (competitorId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/competitors/${competitorId}`);
      setSelectedCompetitor(response.data);
    } catch (error) {
      console.error("Error fetching competitor:", error);
    }
    setLoading(false);
  };

  // Cache for all products
  const [allProducts, setAllProducts] = useState([]);
  
  // Fetch all products once when tab changes to existing
  useEffect(() => {
    if (activeTab === "existing" && allProducts.length === 0) {
      fetchAllProducts();
    }
  }, [activeTab]);
  
  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products`);
      const products = response.data.data || response.data || [];
      console.log("Fetched products:", products.length);
      setAllProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const searchProducts = async (query) => {
    setProductSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // If products not loaded yet, fetch them
    if (allProducts.length === 0) {
      await fetchAllProducts();
    }
    
    // Filter products by search query
    const queryLower = query.toLowerCase();
    const filtered = allProducts.filter(p => {
      const name = (p.productName || p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const pid = (p.productId || p._id || '').toLowerCase();
      return name.includes(queryLower) || brand.includes(queryLower) || pid.includes(queryLower);
    }).slice(0, 10);
    
    console.log("Search results:", filtered.length, "for query:", query);
    setSearchResults(filtered);
  };

  const handleAddProduct = async () => {
    if (!selectedCompetitor || !selectedProduct || !productPrice) {
      alert("Please select a product and enter a price");
      return;
    }

    try {
      // Always use today's date
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.post(
        `${API_BASE}/competitors/${selectedCompetitor._id}/products`,
        { productId: selectedProduct._id, price: parseFloat(productPrice), date: today }
      );
      setSelectedCompetitor(response.data);
      setSelectedProduct(null);
      setProductPrice("");
      setProductSearch("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product");
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!selectedCompetitor) return;

    try {
      const response = await axios.delete(
        `${API_BASE}/competitors/${selectedCompetitor._id}/products/${productId}`
      );
      setSelectedCompetitor(response.data);
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-purple-700 text-white p-4 rounded-lg mb-6 shadow-md">
            <div className="flex items-center gap-3">
              <Building2 size={28} />
              <h1 className="text-2xl font-bold">257. Competitors</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "create"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Create New Competitor
            </button>
            <button
              onClick={() => setActiveTab("existing")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "existing"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Existing Competitor
            </button>
          </div>

          {/* Create New Competitor Tab */}
          {activeTab === "create" && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Create New Competitor</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Unique Generated ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1. Unique Generated ID
                    </label>
                    <input
                      type="text"
                      value={formData.competitorId}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2. Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter competitor name"
                    />
                  </div>

                  {/* Google Maps Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3. Google Maps Location *
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-gray-500" size={20} />
                      <input
                        type="text"
                        name="googleMapsLocation"
                        value={formData.googleMapsLocation}
                        onChange={handleInputChange}
                        required
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter Google Maps URL or embed link"
                      />
                    </div>
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4. Photo of Location *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'photoLocation')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      5. Photo of Shop (Far) *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'photoShopFar')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      6. Photo of Shop (Close) *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'photoShopClose')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      7. Photo Street Left *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'photoStreetLeft')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      8. Photo Street Right *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'photoStreetRight')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      9. Phone Number *
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-500" size={20} />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Shop Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      10. Shop Size
                    </label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="shopSize"
                          value="small"
                          checked={formData.shopSize === "small"}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-purple-600"
                        />
                        <span>Small Shop</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="shopSize"
                          value="large"
                          checked={formData.shopSize === "large"}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-purple-600"
                        />
                        <span>Large Shop</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Geographic Location Section */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4">Geographic Location *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Island *</label>
                      <select
                        value={selectedIsland}
                        onChange={(e) => setSelectedIsland(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Island...</option>
                        {islands.map(i => (
                          <option key={i._id} value={i._id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Larger State *</label>
                      <select
                        value={selectedLargerState}
                        onChange={(e) => setSelectedLargerState(e.target.value)}
                        disabled={!selectedIsland}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                      >
                        <option value="">Select Larger State...</option>
                        {largerStates.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Regency *</label>
                      <select
                        value={selectedRegency}
                        onChange={(e) => setSelectedRegency(e.target.value)}
                        disabled={!selectedLargerState}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                      >
                        <option value="">Select Regency...</option>
                        {regencies.map(r => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                      <select
                        value={selectedGeoArea}
                        onChange={(e) => setSelectedGeoArea(e.target.value)}
                        disabled={!selectedRegency}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                      >
                        <option value="">Select Area...</option>
                        {areas.map(a => (
                          <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Display Name - Auto-filled from selected Area */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name (from Area)</label>
                    <input
                      type="text"
                      value={formData.displayName || "-"}
                      readOnly
                      className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Competitor"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Competitor Tab */}
          {activeTab === "existing" && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Existing Competitors</h2>
              
              {/* Competitor Search Bar */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Competitors
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={competitorSearch}
                    onChange={(e) => setCompetitorSearch(e.target.value)}
                    className="w-full md:w-1/2 pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Search by name, ID, phone, location..."
                  />
                </div>
              </div>
              
              {/* Competitor Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Competitor
                </label>
                <select
                  onChange={(e) => handleSelectCompetitor(e.target.value)}
                  className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a competitor...</option>
                  {competitors
                    .filter(c => {
                      if (!competitorSearch) return true;
                      const search = competitorSearch.toLowerCase();
                      return (
                        (c.name && c.name.toLowerCase().includes(search)) ||
                        (c.competitorId && c.competitorId.toLowerCase().includes(search)) ||
                        (c.phoneNumber && c.phoneNumber.toLowerCase().includes(search)) ||
                        (c.googleMapsLocation && c.googleMapsLocation.toLowerCase().includes(search)) ||
                        (c.geo1 && c.geo1.toLowerCase().includes(search)) ||
                        (c.geo2 && c.geo2.toLowerCase().includes(search)) ||
                        (c.geo3 && c.geo3.toLowerCase().includes(search)) ||
                        (c.shopSize && c.shopSize.toLowerCase().includes(search))
                      );
                    })
                    .map(c => (
                    <option key={c._id} value={c._id}>
                      {c.competitorId} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Competitor Details */}
              {selectedCompetitor && (
                <div className="mt-6">
                  {/* Competitor Info Card */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      {selectedCompetitor.name} ({selectedCompetitor.competitorId})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600"><strong>Phone:</strong> {selectedCompetitor.phoneNumber || "N/A"}</p>
                        <p className="text-gray-600"><strong>Shop Size:</strong> {selectedCompetitor.shopSize}</p>
                        <p className="text-gray-600"><strong>Google Maps:</strong> {selectedCompetitor.googleMapsLocation || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><strong>Geo 1:</strong> {selectedCompetitor.geo1 || "Not set"}</p>
                        <p className="text-gray-600"><strong>Geo 2:</strong> {selectedCompetitor.geo2 || "Not set"}</p>
                        <p className="text-gray-600"><strong>Geo 3:</strong> {selectedCompetitor.geo3 || "Not set"}</p>
                      </div>
                    </div>

                    {/* Photos Grid */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Photos</h4>
                      <div className="flex flex-wrap gap-4">
                        {selectedCompetitor.photoLocation && (
                          <div className="text-center">
                            <img src={`http://localhost:5000${selectedCompetitor.photoLocation}`} alt="Location" className="w-24 h-24 object-cover rounded-lg border" />
                            <p className="text-xs text-gray-500 mt-1">Location</p>
                          </div>
                        )}
                        {selectedCompetitor.photoShopFar && (
                          <div className="text-center">
                            <img src={`http://localhost:5000${selectedCompetitor.photoShopFar}`} alt="Shop Far" className="w-24 h-24 object-cover rounded-lg border" />
                            <p className="text-xs text-gray-500 mt-1">Shop Far</p>
                          </div>
                        )}
                        {selectedCompetitor.photoShopClose && (
                          <div className="text-center">
                            <img src={`http://localhost:5000${selectedCompetitor.photoShopClose}`} alt="Shop Close" className="w-24 h-24 object-cover rounded-lg border" />
                            <p className="text-xs text-gray-500 mt-1">Shop Close</p>
                          </div>
                        )}
                        {selectedCompetitor.photoStreetLeft && (
                          <div className="text-center">
                            <img src={`http://localhost:5000${selectedCompetitor.photoStreetLeft}`} alt="Street Left" className="w-24 h-24 object-cover rounded-lg border" />
                            <p className="text-xs text-gray-500 mt-1">Street Left</p>
                          </div>
                        )}
                        {selectedCompetitor.photoStreetRight && (
                          <div className="text-center">
                            <img src={`http://localhost:5000${selectedCompetitor.photoStreetRight}`} alt="Street Right" className="w-24 h-24 object-cover rounded-lg border" />
                            <p className="text-xs text-gray-500 mt-1">Street Right</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add Product Section */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h4 className="font-bold text-gray-800 mb-4">Add Product This Competitor Sells</h4>
                    
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Product (by name, brand, or ID)
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => searchProducts(e.target.value)}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Search products..."
                          />
                          {/* Search Results Dropdown */}
                          {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                              {searchResults.map(product => (
                                <div
                                  key={product._id}
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setProductSearch(product.productName);
                                    setSearchResults([]);
                                  }}
                                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                                >
                                  <div className="font-medium">{product.productName}</div>
                                  <div className="text-sm text-gray-500">{product.brand} - {product.productId}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price
                        </label>
                        <input
                          type="number"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter price"
                        />
                      </div>
                      
                      <div className="w-40">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date (Today)
                        </label>
                        <input
                          type="date"
                          value={new Date().toISOString().split('T')[0]}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      
                      <button
                        onClick={handleAddProduct}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add
                      </button>
                    </div>

                    {selectedProduct && (
                      <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                        Selected: <strong>{selectedProduct.productName}</strong> ({selectedProduct.brand})
                      </div>
                    )}
                  </div>

                  {/* Products List */}
                  <div className="bg-white border rounded-lg">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h4 className="font-bold text-gray-800">Products Sold by This Competitor</h4>
                      <span className="text-xs text-gray-500 italic">* Products can only be deleted within 24 hours of adding</span>
                    </div>
                    
                    {selectedCompetitor.products && selectedCompetitor.products.length > 0 ? (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Brand</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCompetitor.products.map((item, index) => {
                            // Check if item was added within last 24 hours
                            const addedAt = item.addedAt ? new Date(item.addedAt) : new Date(item.date);
                            const now = new Date();
                            const hoursDiff = (now - addedAt) / (1000 * 60 * 60);
                            const isDeleteable = hoursDiff <= 24;
                            
                            return (
                              <tr key={index} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">{item.productId?.productName || "N/A"}</td>
                                <td className="px-4 py-3">{item.productId?.brand || "N/A"}</td>
                                <td className="px-4 py-3">{item.productId?.productId || "N/A"}</td>
                                <td className="px-4 py-3 font-semibold text-green-600">{item.price}</td>
                                <td className="px-4 py-3">{item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</td>
                                <td className="px-4 py-3">
                                  {isDeleteable ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleRemoveProduct(item.productId?._id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete (available for 24 hours)"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                      <span className="text-xs text-green-600">Can delete</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">Locked</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No products added yet. Use the search above to add products.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Competitors;
