// client/src/components/AddCategory.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import { toast } from "react-hot-toast";
import {
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  XCircle as XIcon,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function AddCategory() {
  // --- State hooks ---
  const [name, setName] = useState("");
  const [subs, setSubs] = useState([""]);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Load categories ---
  const loadCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`);
      setCategories(data.data);
    } catch {
      toast.error("Could not load categories");
    }
  };
  useEffect(() => {
    loadCategories();
  }, []);

  // --- Form helpers ---
  const addSub = () => setSubs((s) => [...s, ""]);
  const removeSub = (i) => setSubs((s) => s.filter((_, idx) => idx !== i));
  const updateSub = (i, val) => {
    setSubs((s) => s.map((x, idx) => (idx === i ? val : x)));
  };

  // --- Submit new category ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/api/categories`, {
        name: name.trim(),
        subcategories: subs.filter((s) => s.trim()),
      });
      toast.success("Saved!");
      setName("");
      setSubs([""]);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete entire category ---
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/api/categories/${id}`);
      toast.success("Deleted");
      setCategories((c) => c.filter((x) => x._id !== id));
    } catch {
      toast.error("Deletion failed");
    }
  };

  // --- Delete one subcategory ---
  const deleteSubcategory = async (catId, sub) => {
    const cat = categories.find((c) => c._id === catId);
    const updated = cat.subcategories.filter((s) => s !== sub);
    try {
      const res = await axios.patch(`${API_URL}/api/categories/${catId}`, {
        subcategories: updated,
      });
      toast.success(`Removed "${sub}"`);
      setCategories((cats) =>
        cats.map((c) => (c._id === catId ? res.data.data : c))
      );
    } catch {
      toast.error("Couldn’t remove subcategory");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((o) => !o)}
      />

      {/* Main area */}
      <div
        className={`
          transition-all duration-300 flex-grow
          ${isSidebarOpen ? "lg:ml-80" : "lg:ml-20"}
          p-6
        `}
      >
        {/* Two-column on md+, single on sm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* — Add / Edit Form Card — */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
              <h2 className="text-white text-2xl font-semibold text-center">
                <PlusIcon size={20} className="inline mr-2" />
                Add Category
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g. Electronics"
                />
              </div>

              {/* Subcategories */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subcategories
                </label>
                <div className="space-y-3">
                  {subs.map((sub, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={sub}
                        onChange={(e) => updateSub(i, e.target.value)}
                        className="flex-grow border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder={`Subcategory #${i + 1}`}
                      />
                      {i > 0 && (
                        <XIcon
                          size={20}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={() => removeSub(i)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSub}
                  className="mt-2 flex items-center text-indigo-600 hover:underline"
                >
                  <PlusIcon size={16} /> <span className="ml-1">Add more</span>
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving}
                className={`
                  w-full py-3 rounded-lg text-white font-semibold
                  ${
                    isSaving
                      ? "bg-gray-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }
                  transition
                `}
              >
                {isSaving ? "Saving…" : "Save Category"}
              </button>
            </form>
          </div>

          {/* — Category List Card — */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
              <h2 className="text-white text-2xl font-semibold text-center">
                Saved Categories
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {categories.length === 0 && (
                <p className="text-center text-gray-500">No categories yet.</p>
              )}
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">
                      {cat.name}
                    </h3>
                    <TrashIcon
                      size={18}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={() => deleteCategory(cat._id)}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub}
                        className="flex items-center bg-gray-100 rounded-full px-3 py-1 space-x-2"
                      >
                        <span className="text-gray-700">{sub}</span>
                        <XIcon
                          size={16}
                          className="text-gray-500 hover:text-gray-700 cursor-pointer"
                          onClick={() => deleteSubcategory(cat._id, sub)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
