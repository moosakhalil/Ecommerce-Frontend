// client/src/components/AddCategory.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { toast } from "react-hot-toast";
import {
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  XCircle as XIcon,
  Edit2 as EditIcon,
  Check as CheckIcon,
  X as CancelIcon,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

const API_URL = API_BASE_URL;

export default function AddCategory() {
  // --- State hooks ---
  const [name, setName] = useState("");
  const [subs, setSubs] = useState([""]);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModeToggle, setShowModeToggle] = useState(false);

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSubs, setEditSubs] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Field-level edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingSubIndex, setEditingSubIndex] = useState(null);
  const [tempSubValue, setTempSubValue] = useState("");

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

  // --- Open edit modal ---
  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditSubs([...category.subcategories]);
    setIsEditModalOpen(true);
    setIsEditingName(false);
    setEditingSubIndex(null);
  };

  // --- Close edit modal ---
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setEditName("");
    setEditSubs([]);
    setIsEditingName(false);
    setEditingSubIndex(null);
    setTempSubValue("");
  };

  // --- Save category name ---
  const saveCategoryName = async () => {
    if (!editName.trim()) return toast.error("Category name is required");

    setIsSaving(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/categories/${editingCategory._id}`,
        {
          name: editName.trim(),
        },
      );

      toast.success("Category name updated!");
      setCategories((cats) =>
        cats.map((c) =>
          c._id === editingCategory._id ? response.data.data : c,
        ),
      );
      setEditingCategory(response.data.data);
      setIsEditingName(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Cancel name edit ---
  const cancelNameEdit = () => {
    setEditName(editingCategory.name);
    setIsEditingName(false);
  };

  // --- Start editing subcategory ---
  const startEditingSubcategory = (index) => {
    setEditingSubIndex(index);
    setTempSubValue(editSubs[index]);
  };

  // --- Save single subcategory ---
  const saveSubcategory = async (index) => {
    if (!tempSubValue.trim()) {
      toast.error("Subcategory cannot be empty");
      return;
    }

    const updatedSubs = [...editSubs];
    updatedSubs[index] = tempSubValue.trim();

    setIsSaving(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/categories/${editingCategory._id}`,
        {
          subcategories: updatedSubs.filter((s) => s.trim()), // Filter out empty values
        },
      );

      toast.success(
        editSubs[index] === "" ? "Subcategory added!" : "Subcategory updated!",
      );
      setCategories((cats) =>
        cats.map((c) =>
          c._id === editingCategory._id ? response.data.data : c,
        ),
      );
      setEditingCategory(response.data.data);
      setEditSubs([...response.data.data.subcategories]);
      setEditingSubIndex(null);
      setTempSubValue("");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Cancel subcategory edit ---
  const cancelSubcategoryEdit = () => {
    // If it was a new subcategory (empty), remove it
    if (editSubs[editingSubIndex] === "") {
      setEditSubs(editSubs.filter((_, i) => i !== editingSubIndex));
    }
    setEditingSubIndex(null);
    setTempSubValue("");
  };

  // --- Delete subcategory ---
  const deleteSubcategory = async (index) => {
    if (!window.confirm("Delete this subcategory?")) return;

    const updatedSubs = editSubs.filter((_, i) => i !== index);

    setIsSaving(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/categories/${editingCategory._id}`,
        {
          subcategories: updatedSubs,
        },
      );

      toast.success("Subcategory deleted!");
      setCategories((cats) =>
        cats.map((c) =>
          c._id === editingCategory._id ? response.data.data : c,
        ),
      );
      setEditingCategory(response.data.data);
      setEditSubs([...response.data.data.subcategories]);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Delete failed");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Add new subcategory ---
  const addNewSubcategory = () => {
    setEditSubs([...editSubs, ""]);
    setEditingSubIndex(editSubs.length);
    setTempSubValue("");
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
                <strong>56.</strong> Add Category
              </h2>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModeToggle(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1.5"
                >
                  <span>🚀</span>
                  <span>Advanced</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModeToggle(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1.5"
                >
                  <span>🤖</span>
                  <span>AI</span>
                </button>
              </div>
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
                    <div className="flex items-center space-x-3">
                      <EditIcon
                        size={18}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        onClick={() => openEditModal(cat)}
                        title="Edit category"
                      />
                      <TrashIcon
                        size={18}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => deleteCategory(cat._id)}
                        title="Delete category"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub}
                        className="bg-gray-100 rounded-full px-3 py-1"
                      >
                        <span className="text-gray-700">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                <EditIcon size={24} className="inline mr-2" />
                Edit Category
              </h2>
              <button
                onClick={closeEditModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XIcon size={28} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Category Name Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Name
                  </label>
                  {!isEditingName ? (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <EditIcon size={14} className="mr-1" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={saveCategoryName}
                        disabled={isSaving}
                        className="flex items-center text-green-600 hover:text-green-700 text-sm"
                      >
                        <CheckIcon size={14} className="mr-1" />
                        Save
                      </button>
                      <button
                        onClick={cancelNameEdit}
                        className="flex items-center text-gray-600 hover:text-gray-700 text-sm"
                      >
                        <CancelIcon size={14} className="mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {isEditingName ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Electronics"
                    autoFocus
                  />
                ) : (
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-gray-800">
                    {editName}
                  </div>
                )}
              </div>

              {/* Subcategories List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Subcategories
                  </label>
                  <button
                    onClick={addNewSubcategory}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <PlusIcon size={14} className="mr-1" />
                    Add New
                  </button>
                </div>
                <div className="space-y-3">
                  {editSubs.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No subcategories yet
                    </p>
                  ) : (
                    editSubs.map((sub, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            Subcategory #{index + 1}
                          </span>
                          <div className="flex items-center space-x-2">
                            {editingSubIndex === index ? (
                              <>
                                <button
                                  onClick={() => saveSubcategory(index)}
                                  disabled={isSaving}
                                  className="flex items-center text-green-600 hover:text-green-700 text-sm"
                                >
                                  <CheckIcon size={14} className="mr-1" />
                                  Save
                                </button>
                                <button
                                  onClick={cancelSubcategoryEdit}
                                  className="flex items-center text-gray-600 hover:text-gray-700 text-sm"
                                >
                                  <CancelIcon size={14} className="mr-1" />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditingSubcategory(index)}
                                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  <EditIcon size={14} className="mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteSubcategory(index)}
                                  className="flex items-center text-red-600 hover:text-red-700 text-sm"
                                >
                                  <TrashIcon size={14} className="mr-1" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {editingSubIndex === index ? (
                          <input
                            type="text"
                            value={tempSubValue}
                            onChange={(e) => setTempSubValue(e.target.value)}
                            className="w-full border border-blue-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <div className="w-full bg-gray-50 rounded-lg p-2 text-gray-800">
                            {sub}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t flex justify-end">
              <button
                onClick={closeEditModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModeToggle && (
        <ModeToggle
          componentName="Add Category"
          onClose={() => setShowModeToggle(false)}
        />
      )}
    </div>
  );
}
