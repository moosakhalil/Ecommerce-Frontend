import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  User,
  Users,
  Shield,
  UserCheck,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

export default function ForemanApproval() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let status;
      switch (activeTab) {
        case "pending":
          status = "customers";
          break;
        case "approved":
          status = "approved_foreman";
          break;
        case "all":
          status = "Everyone";
          break;
        default:
          status = "customers";
      }
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers?status=${status}`
      );
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/stats/overview`
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateForemanStatus = async (customerId, isApproved) => {
    try {
      setUpdating(true);
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/update-foreman-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            isApproved,
            staffId: "ADMIN001",
            staffName: "Admin User",
            reason: `${isApproved ? "Approved" : "Revoked"} foreman status`,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
        await fetchStats();
        alert(
          `Customer successfully ${isApproved ? "approved" : "revoked"} as foreman`
        );
      } else {
        alert("Failed to update status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating foreman status:", error);
      alert("Error updating foreman status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.phoneNumber?.includes(search) ||
      customer.referralCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper function to get status badge
  const getStatusBadge = (customer) => {
    if (customer.isCommissionEligible) {
      return (
        <span style={{ 
          padding: '4px 12px', 
          backgroundColor: '#ede9fe', 
          color: '#7c3aed', 
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          💰 Commission Eligible
        </span>
      );
    } else if (customer.isForemanApproved) {
      return (
        <span style={{ 
          padding: '4px 12px', 
          backgroundColor: '#dcfce7', 
          color: '#16a34a', 
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          🛡️ Foreman
        </span>
      );
    } else {
      return (
        <span style={{ 
          padding: '4px 12px', 
          backgroundColor: '#f1f5f9', 
          color: '#64748b', 
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          👤 Normal Customer
        </span>
      );
    }
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
            🛡️ 153. Foreman Approval
          </h1>
          <p style={{ color: '#6b7280' }}>
            Approve or revoke foreman status for customers
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={cardStyle}>
            <User size={24} style={{ color: '#3b82f6', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalCustomers || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Customers</div>
          </div>
          <div style={cardStyle}>
            <Users size={24} style={{ color: '#64748b', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.regularCustomers || ((stats.totalCustomers || 0) - (stats.approvedForeman || 0))}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Normal Customers</div>
          </div>
          <div style={cardStyle}>
            <Shield size={24} style={{ color: '#16a34a', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.approvedForeman || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Approved Foreman</div>
          </div>
          <div style={cardStyle}>
            <ShieldCheck size={24} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.commissionEligible || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Commission Eligible</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === "pending" ? '#3b82f6' : '#f1f5f9',
              color: activeTab === "pending" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Pending Approval
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === "approved" ? '#3b82f6' : '#f1f5f9',
              color: activeTab === "approved" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Shield size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Approved Foreman
          </button>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === "all" ? '#3b82f6' : '#f1f5f9',
              color: activeTab === "all" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Users size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            All Customers
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or referral code..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              color: '#1f2937'
            }}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Referrals</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <tr key={customer._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{customer.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{customer.phoneNumber}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{customer.referralCode}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {activeTab === "all" ? getStatusBadge(customer) : (
                        <>
                          {customer.isForemanApproved ? (
                            <span style={{ 
                              padding: '4px 12px', 
                              backgroundColor: '#dcfce7', 
                              color: '#16a34a', 
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              ✓ Foreman Approved
                            </span>
                          ) : (
                            <span style={{ 
                              padding: '4px 12px', 
                              backgroundColor: '#fef3c7', 
                              color: '#d97706', 
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              Pending
                            </span>
                          )}
                          {customer.foremanApprovalDate && (
                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                              Since: {new Date(customer.foremanApprovalDate).toLocaleDateString()}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1f2937' }}>
                        <UserCheck size={14} style={{ color: '#16a34a' }} />
                        {customer.successfulReferrals || 0} / {customer.totalReferrals || 0}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {activeTab === "all" ? (
                        // All Customers tab - show "Push to Approval" button for normal customers
                        !customer.isForemanApproved && (
                          <button
                            onClick={() => updateForemanStatus(customer._id, true)}
                            disabled={updating}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#3b82f6',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: updating ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              opacity: updating ? 0.6 : 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            Push to Foreman
                            <ArrowRight size={14} />
                          </button>
                        )
                      ) : (
                        // Other tabs - show approve/revoke buttons
                        !customer.isForemanApproved ? (
                          <button
                            onClick={() => updateForemanStatus(customer._id, true)}
                            disabled={updating}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: updating ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              opacity: updating ? 0.6 : 1
                            }}
                          >
                            <CheckCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Approve Foreman
                          </button>
                        ) : (
                          <button
                            onClick={() => updateForemanStatus(customer._id, false)}
                            disabled={updating}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: updating ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              opacity: updating ? 0.6 : 1
                            }}
                          >
                            <XCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Revoke Foreman
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
