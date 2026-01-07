import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  DollarSign,
  Tag,
  FileText,
  CreditCard,
  Wallet,
  Truck,
  Gift,
  Percent,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

// Fee type configuration with labels
const FEE_TYPES = [
  { key: 'item_discount', label: 'Item Discount', category: 'discount', icon: Tag },
  { key: 'multiple_item_discount', label: 'Multiple Item Discount', category: 'discount', icon: Tag },
  { key: 'shipping_cost', label: 'Shipping Cost', category: 'fee', icon: Truck },
  { key: 'handling_fee', label: 'Handling Fee', category: 'fee', icon: DollarSign },
  { key: 'service_fee', label: 'Service Fee', category: 'fee', icon: DollarSign },
  { key: 'insurance_fee', label: 'Insurance Fee', category: 'fee', icon: DollarSign },
  { key: 'gift_wrap_fee', label: 'Gift Wrap Fee', category: 'fee', icon: Gift },
  { key: 'express_fee', label: 'Express Fee', category: 'fee', icon: Truck },
  { key: 'cod_fee_B2C', label: 'COD Fee (B2C)', category: 'fee', icon: CreditCard },
  { key: 'coupon_discount', label: 'Coupon Discount', category: 'discount', icon: Percent },
  { key: 'loyalty_points_discount', label: 'Loyalty Points Discount', category: 'discount', icon: Percent },
  { key: 'store_credit_used', label: 'Store Credit Used', category: 'discount', icon: CreditCard },
  { key: 'gift_card_used', label: 'Gift Card Used', category: 'discount', icon: Gift },
  { key: 'membership_discount', label: 'Membership Discount', category: 'discount', icon: Users },
  { key: 'referral_discount', label: 'Referral Discount', category: 'discount', icon: Users },
  { key: 'display_discount', label: 'Display Discount', category: 'discount', icon: Tag },
];

// Reason Code Categories
const REASON_CATEGORIES = [
  { value: 'discount', label: 'Discount' },
  { value: 'fee', label: 'Fee' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'refund', label: 'Refund' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'other', label: 'Other' },
];

export default function FeeControlManagement() {
  const [activeTab, setActiveTab] = useState("fees");
  
  // Reason Codes State
  const [reasonCodes, setReasonCodes] = useState([]);
  const [newReasonCode, setNewReasonCode] = useState({ code: '', description: '', category: 'other' });
  const [editingReasonId, setEditingReasonId] = useState(null);
  const [editReasonData, setEditReasonData] = useState({});
  
  // Fees State
  const [fees, setFees] = useState([]);
  const [feeControlId, setFeeControlId] = useState(null);
  const [newFee, setNewFee] = useState({ feeType: '', amount: '', reasonCodeId: '', note: '' });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchReasonCodes();
    fetchFees();
  }, []);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // =====================
  // REASON CODE FUNCTIONS
  // =====================
  const fetchReasonCodes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fee-control/reason-codes`);
      const data = await response.json();
      if (data.success) {
        setReasonCodes(data.reasonCodes);
      }
    } catch (error) {
      console.error("Error fetching reason codes:", error);
    }
  };

  const handleAddReasonCode = async () => {
    if (!newReasonCode.code || !newReasonCode.description) {
      setMessage({ type: 'error', text: 'Please fill in code and description' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/fee-control/reason-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReasonCode)
      });
      const data = await response.json();
      
      if (data.success) {
        setReasonCodes([data.reasonCode, ...reasonCodes]);
        setNewReasonCode({ code: '', description: '', category: 'other' });
        setMessage({ type: 'success', text: 'Reason code added successfully' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding reason code' });
    }
  };

  const handleEditReasonCode = (reason) => {
    setEditingReasonId(reason._id);
    setEditReasonData({ ...reason });
  };

  const handleSaveReasonCode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fee-control/reason-codes/${editingReasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editReasonData)
      });
      const data = await response.json();
      
      if (data.success) {
        setReasonCodes(reasonCodes.map(r => r._id === editingReasonId ? data.reasonCode : r));
        setEditingReasonId(null);
        setMessage({ type: 'success', text: 'Reason code updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating reason code' });
    }
  };

  const handleDeleteReasonCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reason code?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/fee-control/reason-codes/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setReasonCodes(reasonCodes.filter(r => r._id !== id));
        setMessage({ type: 'success', text: 'Reason code deleted successfully' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting reason code' });
    }
  };

  // =====================
  // FEES FUNCTIONS
  // =====================
  const fetchFees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fee-control/fees/standalone/all`);
      const data = await response.json();
      if (data.success) {
        setFees(data.fees || []);
        setFeeControlId(data.feeControlId);
      }
    } catch (error) {
      console.error("Error fetching fees:", error);
    }
  };

  const handleAddFee = async () => {
    if (!newFee.feeType || !newFee.amount) {
      setMessage({ type: 'error', text: 'Please select fee type and enter amount' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/fee-control/fees/standalone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFee)
      });
      const data = await response.json();
      
      if (data.success) {
        setFees(data.feeControl.fees || []);
        setFeeControlId(data.feeControl._id);
        setNewFee({ feeType: '', amount: '', reasonCodeId: '', note: '' });
        setMessage({ type: 'success', text: 'Fee entry added successfully' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding fee entry' });
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!feeControlId) return;
    if (!window.confirm('Are you sure you want to delete this fee entry?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/fee-control/fees/${feeControlId}/fee/${feeId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setFees(fees.filter(f => f._id !== feeId));
        setMessage({ type: 'success', text: 'Fee entry deleted successfully' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting fee entry' });
    }
  };

  // Get fee type label
  const getFeeTypeLabel = (key) => {
    const feeType = FEE_TYPES.find(f => f.key === key);
    return feeType ? feeType.label : key;
  };

  // Styles
  const inputStyle = {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontSize: '14px',
    width: '100%'
  };

  const buttonStyle = {
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const tableHeaderStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  };

  const tableCellStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    color: '#1f2937'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Sidebar />
      
      <div style={{ 
        flex: 1, 
        padding: '24px 32px', 
        marginLeft: '320px',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            💰 Fee Control Management
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage fee types, reason codes, and billing adjustments
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${message.type === 'success' ? '#16a34a' : '#dc2626'}`,
            color: message.type === 'success' ? '#16a34a' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab("fees")}
            style={{
              ...buttonStyle,
              backgroundColor: activeTab === "fees" ? '#2563eb' : '#f1f5f9',
              color: activeTab === "fees" ? '#ffffff' : '#374151',
            }}
          >
            <DollarSign size={18} />
            Fees Management
          </button>
          <button
            onClick={() => setActiveTab("reasons")}
            style={{
              ...buttonStyle,
              backgroundColor: activeTab === "reasons" ? '#2563eb' : '#f1f5f9',
              color: activeTab === "reasons" ? '#ffffff' : '#374151',
            }}
          >
            <Tag size={18} />
            Reason Codes
          </button>
        </div>

        {/* ===================== */}
        {/* REASON CODES TAB */}
        {/* ===================== */}
        {activeTab === "reasons" && (
          <div>
            {/* Add New Reason Code Form */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                <Plus size={18} style={{ marginRight: '8px', display: 'inline' }} />
                Add New Reason Code
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    Code *
                  </label>
                  <input
                    type="text"
                    value={newReasonCode.code}
                    onChange={(e) => setNewReasonCode({ ...newReasonCode, code: e.target.value })}
                    placeholder="e.g., PROMO01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    Description *
                  </label>
                  <input
                    type="text"
                    value={newReasonCode.description}
                    onChange={(e) => setNewReasonCode({ ...newReasonCode, description: e.target.value })}
                    placeholder="e.g., Promotional discount for new customers"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    Category
                  </label>
                  <select
                    value={newReasonCode.category}
                    onChange={(e) => setNewReasonCode({ ...newReasonCode, category: e.target.value })}
                    style={inputStyle}
                  >
                    {REASON_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddReasonCode}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    height: '42px'
                  }}
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            {/* Reason Codes Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Code</th>
                    <th style={tableHeaderStyle}>Description</th>
                    <th style={tableHeaderStyle}>Category</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reasonCodes.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ ...tableCellStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                        No reason codes found. Add one above to get started.
                      </td>
                    </tr>
                  ) : (
                    reasonCodes.map((reason) => (
                      <tr key={reason._id}>
                        {editingReasonId === reason._id ? (
                          <>
                            <td style={tableCellStyle}>
                              <input
                                type="text"
                                value={editReasonData.code}
                                onChange={(e) => setEditReasonData({ ...editReasonData, code: e.target.value })}
                                style={{ ...inputStyle, width: '120px' }}
                              />
                            </td>
                            <td style={tableCellStyle}>
                              <input
                                type="text"
                                value={editReasonData.description}
                                onChange={(e) => setEditReasonData({ ...editReasonData, description: e.target.value })}
                                style={inputStyle}
                              />
                            </td>
                            <td style={tableCellStyle}>
                              <select
                                value={editReasonData.category}
                                onChange={(e) => setEditReasonData({ ...editReasonData, category: e.target.value })}
                                style={{ ...inputStyle, width: '120px' }}
                              >
                                {REASON_CATEGORIES.map(cat => (
                                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                              </select>
                            </td>
                            <td style={tableCellStyle}>
                              <select
                                value={editReasonData.isActive}
                                onChange={(e) => setEditReasonData({ ...editReasonData, isActive: e.target.value === 'true' })}
                                style={{ ...inputStyle, width: '100px' }}
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                              <button onClick={handleSaveReasonCode} style={{ ...buttonStyle, backgroundColor: '#16a34a', color: '#fff', marginRight: '8px', display: 'inline-flex' }}>
                                <Save size={16} />
                              </button>
                              <button onClick={() => setEditingReasonId(null)} style={{ ...buttonStyle, backgroundColor: '#6b7280', color: '#fff', display: 'inline-flex' }}>
                                <X size={16} />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={tableCellStyle}>
                              <span style={{ 
                                backgroundColor: '#e0f2fe', 
                                color: '#0369a1', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                fontWeight: '500',
                                fontSize: '13px'
                              }}>
                                {reason.code}
                              </span>
                            </td>
                            <td style={tableCellStyle}>{reason.description}</td>
                            <td style={tableCellStyle}>
                              <span style={{ 
                                backgroundColor: '#f3f4f6', 
                                color: '#374151', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}>
                                {REASON_CATEGORIES.find(c => c.value === reason.category)?.label || reason.category}
                              </span>
                            </td>
                            <td style={tableCellStyle}>
                              <span style={{ 
                                backgroundColor: reason.isActive ? '#dcfce7' : '#fee2e2', 
                                color: reason.isActive ? '#16a34a' : '#dc2626', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}>
                                {reason.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                              <button 
                                onClick={() => handleEditReasonCode(reason)} 
                                style={{ ...buttonStyle, backgroundColor: '#3b82f6', color: '#fff', marginRight: '8px', display: 'inline-flex', padding: '6px 10px' }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteReasonCode(reason._id)} 
                                style={{ ...buttonStyle, backgroundColor: '#dc2626', color: '#fff', display: 'inline-flex', padding: '6px 10px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== */}
        {/* FEES TAB */}
        {/* ===================== */}
        {activeTab === "fees" && (
          <div>
            {/* Add New Fee Form */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>
                <Plus size={18} style={{ marginRight: '8px', display: 'inline' }} />
                Add Fee Entry
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 2fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    Fee Type *
                  </label>
                  <select
                    value={newFee.feeType}
                    onChange={(e) => setNewFee({ ...newFee, feeType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select fee type...</option>
                    <optgroup label="Discounts">
                      {FEE_TYPES.filter(f => f.category === 'discount').map(fee => (
                        <option key={fee.key} value={fee.key}>{fee.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Fees">
                      {FEE_TYPES.filter(f => f.category === 'fee').map(fee => (
                        <option key={fee.key} value={fee.key}>{fee.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    Reason Code
                  </label>
                  <select
                    value={newFee.reasonCodeId}
                    onChange={(e) => setNewFee({ ...newFee, reasonCodeId: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select reason...</option>
                    {reasonCodes.filter(r => r.isActive).map(reason => (
                      <option key={reason._id} value={reason._id}>{reason.code} - {reason.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    Note
                  </label>
                  <input
                    type="text"
                    value={newFee.note}
                    onChange={(e) => setNewFee({ ...newFee, note: e.target.value })}
                    placeholder="Additional notes..."
                    style={inputStyle}
                  />
                </div>
                <button
                  onClick={handleAddFee}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    height: '42px'
                  }}
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            {/* Fees Table */}
            <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Fee Type</th>
                    <th style={tableHeaderStyle}>Amount</th>
                    <th style={tableHeaderStyle}>Reason Code</th>
                    <th style={tableHeaderStyle}>Note</th>
                    <th style={tableHeaderStyle}>Date</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ ...tableCellStyle, textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                        No fee entries found. Add one above to get started.
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => (
                      <tr key={fee._id}>
                        <td style={tableCellStyle}>
                          <span style={{ 
                            backgroundColor: FEE_TYPES.find(f => f.key === fee.feeType)?.category === 'discount' ? '#fef3c7' : '#dbeafe',
                            color: FEE_TYPES.find(f => f.key === fee.feeType)?.category === 'discount' ? '#92400e' : '#1e40af',
                            padding: '4px 10px', 
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}>
                            {getFeeTypeLabel(fee.feeType)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{ 
                            fontWeight: '600',
                            color: FEE_TYPES.find(f => f.key === fee.feeType)?.category === 'discount' ? '#dc2626' : '#16a34a'
                          }}>
                            {FEE_TYPES.find(f => f.key === fee.feeType)?.category === 'discount' ? '-' : '+'}
                            Rs. {fee.amount?.toFixed(2)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          {fee.reasonCode ? (
                            <span style={{ 
                              backgroundColor: '#e0f2fe', 
                              color: '#0369a1', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {fee.reasonCode.code}
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td style={tableCellStyle}>{fee.note || '-'}</td>
                        <td style={tableCellStyle}>
                          {fee.appliedAt ? new Date(fee.appliedAt).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteFee(fee._id)} 
                            style={{ ...buttonStyle, backgroundColor: '#dc2626', color: '#fff', display: 'inline-flex', padding: '6px 10px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Static Section - Wallet & Final Calculation */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '18px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <Wallet size={20} style={{ marginRight: '8px', display: 'inline' }} />
                Wallet & Final Calculation (Static Preview)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div>
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        <Wallet size={16} style={{ marginRight: '6px', display: 'inline' }} />
                        Wallet Balance Used
                      </span>
                      <span style={{ color: '#1f2937', fontWeight: '600' }}>Rs. 0.00</span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} />
                      (Amount available) Needs approval from here to use
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        <Percent size={16} style={{ marginRight: '6px', display: 'inline' }} />
                        Wallet Commission 1% Foreman
                      </span>
                      <span style={{ color: '#16a34a', fontWeight: '600' }}>1%</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        <Users size={16} style={{ marginRight: '6px', display: 'inline' }} />
                        Commission 1% Foreman Allocated To
                      </span>
                      <span style={{ color: '#6b7280', fontStyle: 'italic' }}>(ID) Automatic</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        <Truck size={16} style={{ marginRight: '6px', display: 'inline' }} />
                        Delivery Fee
                      </span>
                      <span style={{ color: '#1f2937', fontWeight: '600' }}>(HAVE)</span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        <Tag size={16} style={{ marginRight: '6px', display: 'inline' }} />
                        Display Discount
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#6b7280' }}>(Manual add amount)</span>
                      <span style={{ color: '#6b7280' }}>(Reason dropdown manual)</span>
                      <span style={{ color: '#6b7280' }}>(Note)</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '2px solid #1f2937', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ backgroundColor: '#f8fafc', padding: '0 12px', position: 'relative', top: '-10px', color: '#6b7280', fontSize: '12px' }}>
                      ══════════════════════════
                    </span>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#1e40af', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>
                        <DollarSign size={20} style={{ marginRight: '6px', display: 'inline' }} />
                        Net Total Final Payment
                      </span>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>Rs. 0.00</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                    <div style={{ marginBottom: '8px', color: '#92400e', fontWeight: '500', fontSize: '13px' }}>
                      <FileText size={14} style={{ marginRight: '6px', display: 'inline' }} />
                      Last line after they buy:
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>Referral Discount</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', marginTop: '8px' }}>
                      <span style={{ color: '#6b7280' }}>(Manual add amount)</span>
                      <span style={{ color: '#6b7280' }}>(Reason dropdown manual)</span>
                      <span style={{ color: '#6b7280' }}>(Note)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
