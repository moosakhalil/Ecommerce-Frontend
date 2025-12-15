import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Indonesian flag SVG component
const IndonesianFlag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3 2"
    width="24"
    height="16"
    className="mr-1"
  >
    <rect width="3" height="1" fill="#ff0000" />
    <rect width="3" height="1" y="1" fill="#ffffff" />
  </svg>
);

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-10 w-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            Success!
          </h3>
          <p className="text-sm text-gray-500 mb-4">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const EditSupplierModal = ({ supplier, onClose }) => {
  const [formData, setFormData] = useState({
    ...supplier,
    profilePicture: null,
    idCardFront: null,
    idCardBack: null,
    passportFront: null,
    passportBack: null,
    otherDocs: [],
    existingOtherDocs: supplier.otherDocs || [],
    relatedPeople: supplier.relatedPeople || [],
  });

  // Phone number state without country code
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondPhoneNumber, setSecondPhoneNumber] = useState("");

  const [previewUrls, setPreviewUrls] = useState({
    profilePicture: supplier.profilePicture
      ? `http://localhost:5000${supplier.profilePicture}`
      : null,
    idCardFront: supplier.idCardFront
      ? `http://localhost:5000${supplier.idCardFront}`
      : null,
    idCardBack: supplier.idCardBack
      ? `http://localhost:5000${supplier.idCardBack}`
      : null,
    passportFront: supplier.passportFront
      ? `http://localhost:5000${supplier.passportFront}`
      : null,
    passportBack: supplier.passportBack
      ? `http://localhost:5000${supplier.passportBack}`
      : null,
    otherDocs: [],
    existingOtherDocs: supplier.otherDocs
      ? supplier.otherDocs.map((doc) => `http://localhost:5000${doc}`)
      : [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
  });

  // Related person input state
  const [currentPerson, setCurrentPerson] = useState({
    name: "",
    title: "",
    phone: "",
    profilePicture: null,
  });
  const [currentPersonPhone, setCurrentPersonPhone] = useState("");
  const [currentPersonPreview, setCurrentPersonPreview] = useState(null);
  const [relatedPeoplePreviews, setRelatedPeoplePreviews] = useState([]);

  // Initialize phone values from formData
  useEffect(() => {
    if (supplier.phone && supplier.phone.startsWith("+62")) {
      setPhoneNumber(supplier.phone.substring(3)); // Remove +62
    } else {
      setPhoneNumber(supplier.phone);
    }

    if (supplier.secondPhone && supplier.secondPhone.startsWith("+62")) {
      setSecondPhoneNumber(supplier.secondPhone.substring(3)); // Remove +62
    } else {
      setSecondPhoneNumber(supplier.secondPhone || "");
    }

    // Initialize related people previews
    if (supplier.relatedPeople && supplier.relatedPeople.length > 0) {
      const previews = supplier.relatedPeople.map((person) =>
        person.profilePicture
          ? `http://localhost:5000${person.profilePicture}`
          : null
      );
      setRelatedPeoplePreviews(previews);
    }
  }, [supplier]);

  // Handle phone number input change
  const handlePhoneChange = (e, field) => {
    const { value } = e.target;
    // Allow only numbers and limit to 11 digits
    const sanitizedValue = value.replace(/\D/g, "").substring(0, 11);

    if (field === "phone") {
      setPhoneNumber(sanitizedValue);
      setFormData((prev) => ({
        ...prev,
        phone: sanitizedValue ? `+62${sanitizedValue}` : "",
      }));

      // Clear error when field is edited
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: null }));
      }
    } else {
      setSecondPhoneNumber(sanitizedValue);
      setFormData((prev) => ({
        ...prev,
        secondPhone: sanitizedValue ? `+62${sanitizedValue}` : "",
      }));

      // Clear error when field is edited
      if (errors.secondPhone) {
        setErrors((prev) => ({ ...prev, secondPhone: null }));
      }
    }
  };

  // Validate Indonesian phone number
  const validateIndonesianPhone = (phone) => {
    // Indonesian phone numbers with +62 prefix
    return (
      phone &&
      phone.startsWith("+62") &&
      phone.length >= 10 &&
      phone.length <= 14
    );
  };

  // Validate email address
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (formData.email?.trim() && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validateIndonesianPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Indonesian phone number";
    }

    if (
      formData.secondPhone &&
      !validateIndonesianPhone(formData.secondPhone)
    ) {
      newErrors.secondPhone = "Please enter a valid Indonesian phone number";
    }

    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.warehouseLocation?.trim())
      newErrors.warehouseLocation = "Warehouse location is required";

    // Check if at least ID card or passport is uploaded or already exists
    const hasIdCardFront = formData.idCardFront || previewUrls.idCardFront;
    const hasIdCardBack = formData.idCardBack || previewUrls.idCardBack;
    const hasPassportFront =
      formData.passportFront || previewUrls.passportFront;
    const hasPassportBack = formData.passportBack || previewUrls.passportBack;

    const hasIdCard = hasIdCardFront && hasIdCardBack;
    const hasPassport = hasPassportFront && hasPassportBack;

    if (!hasIdCard && !hasPassport) {
      newErrors.documents =
        "Either ID card (both sides) or passport (both sides) is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      // Handle multiple files for otherDocs
      if (name === "otherDocs") {
        const newFiles = Array.from(files);
        const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

        setFormData((prev) => ({
          ...prev,
          otherDocs: [...(prev.otherDocs || []), ...newFiles],
        }));

        setPreviewUrls((prev) => ({
          ...prev,
          otherDocs: [...(prev.otherDocs || []), ...newPreviews],
        }));
        
        // Reset the input so the same file can be added again if needed
        e.target.value = null;
        return;
      }

      // Single file handling for other fields
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreviewUrls((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(files[0]),
      }));

      // Clear document error if either ID or passport is now complete
      if (
        (name.includes("idCard") &&
          (name === "idCardFront"
            ? true
            : formData.idCardFront || previewUrls.idCardFront) &&
          (name === "idCardBack"
            ? true
            : formData.idCardBack || previewUrls.idCardBack)) ||
        (name.includes("passport") &&
          (name === "passportFront"
            ? true
            : formData.passportFront || previewUrls.passportFront) &&
          (name === "passportBack"
            ? true
            : formData.passportBack || previewUrls.passportBack))
      ) {
        setErrors((prev) => ({ ...prev, documents: null }));
      }
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (name) => {
    // Revoke object URL to avoid memory leaks if it's a new file
    if (
      previewUrls[name] &&
      !previewUrls[name].includes(
        "http://localhost:5000"
      )
    ) {
      URL.revokeObjectURL(previewUrls[name]);
    }

    // Set the file input to null
    setFormData((prev) => ({ ...prev, [name]: null }));

    // For existing server images, we need to track that we want to remove them
    if (
      previewUrls[name] &&
      previewUrls[name].includes("http://localhost:5000")
    ) {
      setFormData((prev) => ({
        ...prev,
        [`remove${name.charAt(0).toUpperCase() + name.slice(1)}`]: true,
      }));
    }

    // Clear the preview
    setPreviewUrls((prev) => ({ ...prev, [name]: null }));

    // Check if removing an image affects the document validation
    const updatedIdCardFront =
      name === "idCardFront"
        ? null
        : formData.idCardFront || previewUrls.idCardFront;
    const updatedIdCardBack =
      name === "idCardBack"
        ? null
        : formData.idCardBack || previewUrls.idCardBack;
    const updatedPassportFront =
      name === "passportFront"
        ? null
        : formData.passportFront || previewUrls.passportFront;
    const updatedPassportBack =
      name === "passportBack"
        ? null
        : formData.passportBack || previewUrls.passportBack;

    const hasIdCard = updatedIdCardFront && updatedIdCardBack;
    const hasPassport = updatedPassportFront && updatedPassportBack;

    if (!hasIdCard && !hasPassport) {
      setErrors((prev) => ({
        ...prev,
        documents:
          "Either ID card (both sides) or passport (both sides) is required",
      }));
    }
  };

  // Remove new otherDoc by index
  const handleRemoveOtherDoc = (index) => {
    // Revoke object URL to avoid memory leaks
    if (previewUrls.otherDocs && previewUrls.otherDocs[index]) {
      URL.revokeObjectURL(previewUrls.otherDocs[index]);
    }

    setFormData((prev) => ({
      ...prev,
      otherDocs: prev.otherDocs.filter((_, i) => i !== index),
    }));

    setPreviewUrls((prev) => ({
      ...prev,
      otherDocs: prev.otherDocs.filter((_, i) => i !== index),
    }));
  };

  // Remove existing otherDoc from server
  const handleRemoveExistingOtherDoc = async (docPath, index) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/suppliers/${supplier._id}/otherDoc`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: docPath }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete document");
      }

      // Update local state
      setFormData((prev) => ({
        ...prev,
        existingOtherDocs: prev.existingOtherDocs.filter((_, i) => i !== index),
      }));

      setPreviewUrls((prev) => ({
        ...prev,
        existingOtherDocs: prev.existingOtherDocs.filter((_, i) => i !== index),
      }));

      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(error.message || "Failed to delete document");
    }
  };

  // Handle related person phone change
  const handlePersonPhoneChange = (e) => {
    const { value } = e.target;
    const sanitizedValue = value.replace(/\D/g, "").substring(0, 11);
    setCurrentPersonPhone(sanitizedValue);
    setCurrentPerson((prev) => ({
      ...prev,
      phone: sanitizedValue ? `+62${sanitizedValue}` : "",
    }));
  };

  // Handle related person input change
  const handlePersonInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPerson((prev) => ({ ...prev, [name]: value }));
  };

  // Handle related person profile picture
  const handlePersonPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentPerson((prev) => ({ ...prev, profilePicture: file }));
      setCurrentPersonPreview(URL.createObjectURL(file));
    }
  };

  // Remove related person profile picture
  const handleRemovePersonPicture = () => {
    if (currentPersonPreview) {
      URL.revokeObjectURL(currentPersonPreview);
    }
    setCurrentPerson((prev) => ({ ...prev, profilePicture: null }));
    setCurrentPersonPreview(null);
  };

  // Add related person to list
  const handleAddPerson = () => {
    if (!currentPerson.name.trim()) {
      toast.error("Person name is required");
      return;
    }
    if (!currentPerson.title.trim()) {
      toast.error("Person title is required");
      return;
    }
    if (!currentPerson.phone) {
      toast.error("Person phone number is required");
      return;
    }

    const phoneRegex = /^\+62[0-9]{9,11}$/;
    if (!phoneRegex.test(currentPerson.phone)) {
      toast.error("Please enter a valid Indonesian phone number");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      relatedPeople: [...prev.relatedPeople, { ...currentPerson }],
    }));

    // Store preview URL if there's a profile picture
    if (currentPersonPreview) {
      setRelatedPeoplePreviews((prev) => [...prev, currentPersonPreview]);
    } else {
      setRelatedPeoplePreviews((prev) => [...prev, null]);
    }

    // Reset current person
    setCurrentPerson({
      name: "",
      title: "",
      phone: "",
      profilePicture: null,
    });
    setCurrentPersonPhone("");
    setCurrentPersonPreview(null);

    toast.success("Person added successfully");
  };

  // Remove related person from list
  const handleRemovePerson = (index) => {
    const preview = relatedPeoplePreviews[index];
    if (preview && !preview.startsWith('http://localhost:5000')) {
      URL.revokeObjectURL(preview);
    }

    setFormData((prev) => ({
      ...prev,
      relatedPeople: prev.relatedPeople.filter((_, i) => i !== index),
    }));

    setRelatedPeoplePreviews((prev) => prev.filter((_, i) => i !== index));

    toast.info("Person removed");
  };

  const toggleBlockStatus = () => {
    const newStatus = formData.status === "unblocked" ? "blocked" : "unblocked";
    setFormData((prev) => ({ ...prev, status: newStatus }));
  };

  // Close success modal and refresh data
  const closeSuccessModal = () => {
    setSuccessModal({ isOpen: false, message: "" });
    onClose(true); // Refresh
  };

  // Auto-close success modal after delay
  useEffect(() => {
    let timer;
    if (successModal.isOpen) {
      timer = setTimeout(() => {
        closeSuccessModal();
      }, 5000); // 5 seconds

      // Set another timer to reload the page
      setTimeout(() => {
        window.location.reload();
      }, 5500); // 5.5 seconds
    }
    return () => clearTimeout(timer);
  }, [successModal.isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for submission
      const submitData = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        // Skip appending arrays directly and file fields
        if (
          key !== "profilePicture" &&
          key !== "idCardFront" &&
          key !== "idCardBack" &&
          key !== "passportFront" &&
          key !== "passportBack" &&
          key !== "otherDocs" &&
          key !== "existingOtherDocs" &&
          key !== "relatedPeople" && // Skip relatedPeople, we'll handle it separately
          key !== "orders" &&
          key !== "orderedProducts" &&
          key !== "supplyProducts" &&
          !key.startsWith("_") && // Skip MongoDB internal fields
          !key.startsWith("remove") // We'll handle these separately
        ) {
          submitData.append(key, formData[key]);
        }
      });

      // For array fields, either skip or append as JSON strings
      if (formData.orders && formData.orders.length > 0) {
        submitData.append("orders", JSON.stringify(formData.orders));
      }

      if (formData.orderedProducts && formData.orderedProducts.length > 0) {
        submitData.append(
          "orderedProducts",
          JSON.stringify(formData.orderedProducts)
        );
      }

      if (formData.supplyProducts && formData.supplyProducts.length > 0) {
        submitData.append(
          "supplyProducts",
          JSON.stringify(formData.supplyProducts)
        );
      }

      // Handle removal flags
      if (formData.removeProfilePicture) {
        submitData.append("removeProfilePicture", "true");
      }
      if (formData.removeIdCardFront) {
        submitData.append("removeIdCardFront", "true");
      }
      if (formData.removeIdCardBack) {
        submitData.append("removeIdCardBack", "true");
      }
      if (formData.removePassportFront) {
        submitData.append("removePassportFront", "true");
      }
      if (formData.removePassportBack) {
        submitData.append("removePassportBack", "true");
      }

      // Append files
      if (formData.profilePicture)
        submitData.append("profilePicture", formData.profilePicture);
      if (formData.idCardFront)
        submitData.append("idCardFront", formData.idCardFront);
      if (formData.idCardBack)
        submitData.append("idCardBack", formData.idCardBack);
      if (formData.passportFront)
        submitData.append("passportFront", formData.passportFront);
      if (formData.passportBack)
        submitData.append("passportBack", formData.passportBack);

      // Append otherDocs files
      if (formData.otherDocs && formData.otherDocs.length > 0) {
        formData.otherDocs.forEach((file) => {
          submitData.append("otherDocs", file);
        });
      }

      // Handle related people data
      if (formData.relatedPeople && formData.relatedPeople.length > 0) {
        // Prepare related people data
        const relatedPeopleData = formData.relatedPeople.map((person) => ({
          _id: person._id, // Keep existing ID if editing
          name: person.name,
          title: person.title,
          phone: person.phone,
          profilePicture: person.profilePicture && typeof person.profilePicture === 'string' 
            ? person.profilePicture 
            : "", // Keep existing path or empty for new upload
        }));

        submitData.append("relatedPeople", JSON.stringify(relatedPeopleData));

        // Append new profile pictures
        formData.relatedPeople.forEach((person) => {
          if (person.profilePicture && person.profilePicture instanceof File) {
            submitData.append("relatedPeopleImages", person.profilePicture);
          }
        });
      }

      const response = await fetch(
        `http://localhost:5000/api/suppliers/${supplier._id}`,
        {
          method: "PUT",
          body: submitData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update supplier profile");
      }

      // Show success modal
      setSuccessModal({
        isOpen: true,
        message: "Supplier profile has been updated successfully!",
      });

      // Also show toast
      toast.success("Supplier profile updated successfully");
    } catch (error) {
      console.error("Error updating supplier profile:", error);
      toast.error(error.message || "Failed to update supplier profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center overflow-y-auto">
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={closeSuccessModal}
        message={successModal.message}
      />

      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full m-4 p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Edit Supplier
        </h2>

        <hr className="mb-6 border-gray-300" />

        {errors.documents && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{errors.documents}</p>
          </div>
        )}

        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1 - Basic Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Supplier ID
                </label>
                <input
                  type="text"
                  name="supplierId"
                  value={formData._id || ""}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <label className="block text-sm text-gray-700 mb-1">
                  Second Phone
                </label>
                <div className="flex">
                  <div className="flex items-center bg-white border border-r-0 border-gray-300 rounded-l px-2">
                    <IndonesianFlag />
                    <span className="text-gray-600">+62</span>
                  </div>
                  <input
                    type="text"
                    value={secondPhoneNumber}
                    onChange={(e) => handlePhoneChange(e, "secondPhone")}
                    className={`w-full p-2 border ${
                      errors.secondPhone ? "border-red-500" : "border-gray-300"
                    } rounded-r`}
                    placeholder="Enter 11 digits"
                  />
                </div>
                {errors.secondPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.secondPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Location of warehouse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="warehouseLocation"
                  value={formData.warehouseLocation || ""}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    errors.warehouseLocation
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded`}
                />
                {errors.warehouseLocation && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warehouseLocation}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <label className="block text-sm text-gray-700 mb-1">
                  Bank Account
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Column 2 - Contact Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <div className="flex items-center bg-white border border-r-0 border-gray-300 rounded-l px-2">
                    <IndonesianFlag />
                    <span className="text-gray-600">+62</span>
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e, "phone")}
                    className={`w-full p-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-r`}
                    placeholder="Enter 11 digits"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <label className="block text-sm text-gray-700 mb-1">
                  Name/Department/Responsible
                </label>
                <input
                  type="text"
                  name="nameOrDepartment"
                  value={formData.nameOrDepartment || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Contact in case of emergency
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Added on
                </label>
                <input
                  type="date"
                  name="addedOn"
                  value={
                    formData.addedOn
                      ? new Date(formData.addedOn).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <label className="block text-sm text-gray-700 mb-1">
                  Bank name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Column 3 - Profile Picture */}
            <div>
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-1">
                  Profile Picture
                </label>
                <div className="relative">
                  <div className="w-full h-40 overflow-hidden rounded border border-gray-300">
                    {previewUrls.profilePicture ? (
                      <div className="relative h-full">
                        <img
                          src={previewUrls.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("profilePicture")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ID Card and Passport Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Identification Documents
              <span className="text-red-500 text-sm ml-1">
                (Either ID card OR passport is required)
              </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  ID card front
                </label>
                <div className="relative">
                  <div className="w-full h-32 overflow-hidden rounded border border-gray-300">
                    {previewUrls.idCardFront ? (
                      <div className="relative h-full">
                        <img
                          src={previewUrls.idCardFront}
                          alt="ID Front"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("idCardFront")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="idCardFront"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  ID card back
                </label>
                <div className="relative">
                  <div className="w-full h-32 overflow-hidden rounded border border-gray-300">
                    {previewUrls.idCardBack ? (
                      <div className="relative h-full">
                        <img
                          src={previewUrls.idCardBack}
                          alt="ID Back"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("idCardBack")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="idCardBack"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Passport front
                </label>
                <div className="relative">
                  <div className="w-full h-32 overflow-hidden rounded border border-gray-300">
                    {previewUrls.passportFront ? (
                      <div className="relative h-full">
                        <img
                          src={previewUrls.passportFront}
                          alt="Passport Front"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("passportFront")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="passportFront"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Passport back
                </label>
                <div className="relative">
                  <div className="w-full h-32 overflow-hidden rounded border border-gray-300">
                    {previewUrls.passportBack ? (
                      <div className="relative h-full">
                        <img
                          src={previewUrls.passportBack}
                          alt="Passport Back"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("passportBack")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    name="passportBack"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Other Docs Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Other Documents
              <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </h3>

            <div className="mb-4">
              <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors">
                <input
                  type="file"
                  name="otherDocs"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                  multiple
                />
                + Add Document
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Upload additional documents (images or PDFs)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Existing Other Docs from Server */}
              {formData.existingOtherDocs &&
                formData.existingOtherDocs.length > 0 &&
                formData.existingOtherDocs.map((doc, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <div className="w-full h-32 overflow-hidden rounded border border-gray-300">
                      {doc.includes(".pdf") ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                          <svg
                            className="h-12 w-12 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs text-gray-600 mt-1">PDF</span>
                        </div>
                      ) : (
                        <img
                          src={previewUrls.existingOtherDocs[index]}
                          alt={`Other doc ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingOtherDoc(doc, index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove document"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      Existing Doc {index + 1}
                    </p>
                  </div>
                ))}

              {/* Newly Added Other Docs */}
              {formData.otherDocs &&
                formData.otherDocs.length > 0 &&
                formData.otherDocs.map((doc, index) => (
                  <div key={`new-${index}`} className="relative">
                    <div className="w-full h-32 overflow-hidden rounded border border-green-300">
                      {doc.type && doc.type.includes("pdf") ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-green-50">
                          <svg
                            className="h-12 w-12 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs text-gray-600 mt-1">PDF</span>
                        </div>
                      ) : (
                        <img
                          src={previewUrls.otherDocs[index]}
                          alt={`New doc ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherDoc(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove document"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {doc.name}
                    </p>
                    <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                      New
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Related People to the Company Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Related People to the Company
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg mb-4">
              {/* Left side - Input fields */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Name of Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentPerson.name}
                    onChange={handlePersonInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter person name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={currentPerson.title}
                    onChange={handlePersonInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g., Manager, Director, Partner"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <div className="flex items-center bg-white border border-r-0 border-gray-300 rounded-l px-2">
                      <IndonesianFlag />
                      <span className="text-gray-600">+62</span>
                    </div>
                    <input
                      type="text"
                      value={currentPersonPhone}
                      onChange={handlePersonPhoneChange}
                      className="w-full p-2 border border-gray-300 rounded-r"
                      placeholder="Enter 11 digits"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Profile Picture */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Profile Picture
                </label>
                <div className="relative">
                  <div className="w-full h-40 overflow-hidden rounded border border-gray-300">
                    {currentPersonPreview ? (
                      <div className="relative h-full">
                        <img
                          src={currentPersonPreview}
                          alt="Person"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePersonPicture}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    onChange={handlePersonPictureChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddPerson}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              + Add Person
            </button>

            {/* List of added people */}
            {formData.relatedPeople.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-md font-medium text-gray-700">
                  Related People ({formData.relatedPeople.length})
                </h4>
                {formData.relatedPeople.map((person, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-4 rounded-lg border border-gray-200 relative"
                  >
                    {/* Left side - Person details */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Name of Person
                        </label>
                        <p className="text-gray-900 font-medium">
                          {person.name}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Title
                        </label>
                        <p className="text-gray-900">{person.title}</p>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-500 mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-900">{person.phone}</p>
                      </div>
                    </div>

                    {/* Right side - Profile Picture */}
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Profile Picture
                      </label>
                      <div className="w-full h-40 overflow-hidden rounded border border-gray-300">
                        {relatedPeoplePreviews[index] ? (
                          <img
                            src={relatedPeoplePreviews[index]}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove person"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b py-6 border-gray-300">
            <div>
              <button
                type="button"
                onClick={toggleBlockStatus}
                className={
                  formData.status === "unblocked"
                    ? "bg-red-100 rounded-lg p-2 inline-block text-red-800 font-medium mb-2 hover:bg-red-200"
                    : "bg-red-600 rounded-lg p-2 inline-block text-white font-medium mb-2 hover:bg-red-700"
                }
              >
                {formData.status === "unblocked" ? "Block" : "Unblock"}
              </button>
              <div>
                <input
                  type="text"
                  name="status"
                  value={
                    formData.status === "unblocked"
                      ? "Not blocked"
                      : "Blocked - click to unblock"
                  }
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div>
              <div className="bg-green-500 rounded-lg p-2 inline-block text-white font-medium mb-2">
                Activated
              </div>
              <div>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Assigned"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplierModal;
