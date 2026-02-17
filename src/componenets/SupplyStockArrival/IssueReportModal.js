import React, { useState, useRef } from "react";
import ModeToggle from "../Shared/ModeToggle";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const IssueReportModal = ({
  orderId,
  productIndex,
  product,
  onClose,
  onSuccess,
}) => {
  const [selectedCategories, setSelectedCategories] = useState({});
  const [description, setDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Issue category options
  const issueCategories = [
    {
      group: "Product Condition Issues",
      color: "#dc3545",
      items: [
        { value: "product_broken_damaged", label: "Product broken or damaged" },
        {
          value: "scratched_dented_cracked",
          label: "Scratched, dented, or cracked",
        },
        { value: "leaking", label: "Leaking (for liquids)" },
        {
          value: "expired_close_to_expiry",
          label: "Expired or close to expiration date",
        },
        { value: "defective_not_working", label: "Defective / not working" },
        {
          value: "poor_quality_manufacturing_fault",
          label: "Poor quality or manufacturing fault",
        },
      ],
    },
    {
      group: "Quantity Issues",
      color: "#fd7e14",
      items: [
        { value: "missing_items", label: "Missing items" },
        {
          value: "wrong_quantity",
          label: "Wrong quantity (too many / too few)",
        },
        { value: "incomplete_set", label: "Incomplete set or kit" },
        {
          value: "extra_items_by_mistake",
          label: "Extra items included by mistake",
        },
      ],
    },
    {
      group: "Product Specification Issues",
      color: "#6f42c1",
      items: [
        { value: "wrong_color", label: "Wrong color" },
        { value: "wrong_size", label: "Wrong size" },
        { value: "wrong_model_version", label: "Wrong model or version" },
        { value: "wrong_material", label: "Wrong material" },
        {
          value: "wrong_flavor_scent",
          label: "Wrong flavor / scent (if applicable)",
        },
      ],
    },
    {
      group: "Packaging Issues",
      color: "#17a2b8",
      items: [
        { value: "packaging_damaged", label: "Packaging damaged" },
        {
          value: "packaging_opened_tampered",
          label: "Packaging opened or tampered with",
        },
        { value: "missing_packaging", label: "Missing packaging" },
        { value: "incorrect_packaging", label: "Incorrect packaging" },
        { value: "poor_labeling", label: "Poor labeling or unreadable label" },
      ],
    },
    {
      group: "Labeling & Documentation Issues",
      color: "#6c757d",
      items: [
        { value: "wrong_barcode", label: "Wrong barcode" },
        { value: "missing_barcode", label: "Missing barcode" },
        {
          value: "incorrect_product_description",
          label: "Incorrect product description on label",
        },
        {
          value: "missing_instructions_manual",
          label: "Missing instructions or manual",
        },
        {
          value: "missing_warranty_documents",
          label: "Missing warranty card or documents",
        },
      ],
    },
    {
      group: "Order & Shipping Issues",
      color: "#20c997",
      items: [
        { value: "wrong_product_sent", label: "Wrong product sent" },
        { value: "mixed_products", label: "Mixed products in one order" },
        {
          value: "incorrect_customer_order",
          label: "Incorrect customer order",
        },
        { value: "delivery_delay", label: "Delivery delay" },
        { value: "wrong_location", label: "Product sent to wrong location" },
      ],
    },
    {
      group: "Compliance & Safety Issues",
      color: "#e83e8c",
      items: [
        {
          value: "not_meeting_safety_standards",
          label: "Product not meeting safety standards",
        },
        { value: "missing_safety_warnings", label: "Missing safety warnings" },
        {
          value: "incorrect_certification",
          label: "Incorrect certification or approval marks",
        },
      ],
    },
  ];

  // Toggle category selection
  const toggleCategory = (value) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  // Get selected count
  const selectedCount =
    Object.values(selectedCategories).filter(Boolean).length;

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValid =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isUnderLimit = file.size <= 50 * 1024 * 1024; // 50MB
      return isValid && isUnderLimit;
    });

    setMediaFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "photo",
      })),
    ]);
  };

  // Remove media file
  const removeMedia = (index) => {
    setMediaFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Submit issues
  const handleSubmit = async () => {
    const selectedIssues = Object.entries(selectedCategories)
      .filter(([_, selected]) => selected)
      .map(([value]) => value);

    if (selectedIssues.length === 0) {
      alert("Please select at least one issue category");
      return;
    }

    setUploading(true);

    try {
      // Submit each selected issue
      let lastIssueIndex = 0;
      for (const category of selectedIssues) {
        const response = await fetch(
          `${API_BASE_URL}/api/supplier-orders/${orderId}/product-issue/${productIndex}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category,
              description:
                selectedIssues.length === 1
                  ? description
                  : `[${category.replace(/_/g, " ")}] ${description}`,
              reportedBy: "Admin",
            }),
          },
        );

        const data = await response.json();
        if (data.success) {
          lastIssueIndex = data.data.issueIndex;
        }
      }

      // Upload media if any (attach to the last issue)
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        formData.append("productIndex", productIndex);
        formData.append("issueIndex", lastIssueIndex);
        formData.append("isOverallIssue", "false");

        mediaFiles.forEach((media) => {
          formData.append("media", media.file);
        });

        await fetch(
          `${API_BASE_URL}/api/supplier-orders/${orderId}/upload-media`,
          {
            method: "POST",
            body: formData,
          },
        );
      }

      onSuccess();
    } catch (err) {
      console.error("Error reporting issues:", err);
      alert("Failed to report issues");
    } finally {
      setUploading(false);
    }
  };

  // Styles
  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "16px",
      width: "800px",
      maxWidth: "100%",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      padding: "20px 24px",
      borderBottom: "1px solid #eee",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#1a1a2e",
      margin: 0,
    },
    closeBtn: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#6c757d",
    },
    content: {
      padding: "24px",
      overflowY: "auto",
      flex: 1,
    },
    section: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "8px",
    },
    issueGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "16px",
    },
    issueGroup: {
      border: "1px solid #eee",
      borderRadius: "8px",
      padding: "12px",
    },
    issueGroupTitle: {
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    checkbox: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      padding: "6px 0",
      fontSize: "13px",
      cursor: "pointer",
    },
    checkboxInput: {
      marginTop: "2px",
      cursor: "pointer",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      resize: "vertical",
      minHeight: "100px",
      outline: "none",
      fontFamily: "inherit",
    },
    mediaSection: {
      border: "2px dashed #ddd",
      borderRadius: "8px",
      padding: "16px",
      textAlign: "center",
      cursor: "pointer",
      backgroundColor: "#fafafa",
    },
    mediaGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
      gap: "8px",
      marginTop: "12px",
    },
    mediaItem: {
      position: "relative",
      aspectRatio: "1",
      borderRadius: "8px",
      overflow: "hidden",
      backgroundColor: "#f0f0f0",
    },
    mediaPreview: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    removeBtn: {
      position: "absolute",
      top: "2px",
      right: "2px",
      width: "20px",
      height: "20px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      padding: "16px 24px",
      borderTop: "1px solid #eee",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectedCount: {
      fontSize: "14px",
      color: "#6c757d",
    },
    footerButtons: {
      display: "flex",
      gap: "12px",
    },
    btn: {
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
    },
    btnPrimary: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    btnSecondary: {
      backgroundColor: "#e9ecef",
      color: "#333",
    },
    productInfo: {
      backgroundColor: "#f8f9fa",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
    },
    existingIssues: {
      backgroundColor: "#fff3cd",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>⚠️ Report Issue with Product</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Product Info */}
          <div style={styles.productInfo}>
            <strong>{product.productName}</strong>
            <span style={{ color: "#6c757d", marginLeft: "12px" }}>
              ID: {product.productId} • Qty: {product.orderedQuantity}
            </span>
          </div>

          {/* Existing Issues */}
          {product.issues?.length > 0 && (
            <div style={styles.existingIssues}>
              <strong>⚠️ Existing Issues ({product.issues.length}):</strong>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: "20px",
                  fontSize: "13px",
                }}
              >
                {product.issues.map((issue, idx) => (
                  <li key={idx}>{issue.category.replace(/_/g, " ")}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Issue Categories - Checkboxes */}
          <div style={styles.section}>
            <label style={styles.label}>
              Select Issue Categories (can select multiple)
            </label>
            <div style={styles.issueGrid}>
              {issueCategories.map((group) => (
                <div key={group.group} style={styles.issueGroup}>
                  <div
                    style={{ ...styles.issueGroupTitle, color: group.color }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: group.color,
                        borderRadius: "50%",
                      }}
                    ></span>
                    {group.group}
                  </div>
                  {group.items.map((item) => (
                    <label key={item.value} style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={selectedCategories[item.value] || false}
                        onChange={() => toggleCategory(item.value)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <label style={styles.label}>Additional Description</label>
            <textarea
              style={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issues in detail..."
            />
          </div>

          {/* Media Upload */}
          <div style={styles.section}>
            <label style={styles.label}>Photos / Videos</label>
            <div
              style={styles.mediaSection}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>📷</div>
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Click to upload photos or videos
              </div>
              <div
                style={{ color: "#6c757d", fontSize: "11px", marginTop: "2px" }}
              >
                Supports: JPG, PNG, GIF, MP4, MOV (Max 50MB each)
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div style={styles.mediaGrid}>
                {mediaFiles.map((media, index) => (
                  <div key={index} style={styles.mediaItem}>
                    {media.type === "video" ? (
                      <video
                        src={media.preview}
                        style={styles.mediaPreview}
                        muted
                      />
                    ) : (
                      <img
                        src={media.preview}
                        alt={`Upload ${index + 1}`}
                        style={styles.mediaPreview}
                      />
                    )}
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeMedia(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.selectedCount}>
            {selectedCount > 0
              ? `${selectedCount} issue${selectedCount > 1 ? "s" : ""} selected`
              : "No issues selected"}
          </span>
          <div style={styles.footerButtons}>
            <button
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
                opacity: uploading || selectedCount === 0 ? 0.7 : 1,
              }}
              onClick={handleSubmit}
              disabled={uploading || selectedCount === 0}
            >
              {uploading
                ? "Submitting..."
                : `Submit ${selectedCount} Issue${selectedCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueReportModal;
