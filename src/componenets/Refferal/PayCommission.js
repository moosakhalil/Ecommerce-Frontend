import React, { useState, useEffect } from "react";
import {
  Search,
  DollarSign,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

export default function PayCommission() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [stats, setStats] = useState({});
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [paymentHistories, setPaymentHistories] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers?status=approved_commission`
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

  const fetchPaymentHistory = async (customerId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/${customerId}/payment-history`
      );
      const data = await response.json();
      if (data.success) {
        setPaymentHistories(prev => ({
          ...prev,
          [customerId]: data.paymentHistory || []
        }));
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const toggleExpand = async (customerId) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerId);
      if (!paymentHistories[customerId]) {
        await fetchPaymentHistory(customerId);
      }
    }
  };

  const payCommission = async (customerId, customerName, availableAmount) => {
    const amount = prompt(`Enter commission amount to pay (Available: Rs. ${availableAmount.toFixed(2)}):`);
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return;
    }
    if (parseFloat(amount) > availableAmount) {
      alert("Cannot pay more than available commission!");
      return;
    }

    try {
      setPaying(true);
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/pay-commission`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            amount: parseFloat(amount),
            staffId: "ADMIN001",
            staffName: "Admin User",
            notes: `Cash payment of Rs. ${amount} to ${customerName}`,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
        await fetchStats();
        if (expandedCustomer === customerId) {
          await fetchPaymentHistory(customerId);
        }
        alert(`Commission of Rs. ${amount} paid successfully!`);
      } else {
        alert("Failed to pay commission: " + data.message);
      }
    } catch (error) {
      console.error("Error paying commission:", error);
      alert("Error paying commission");
    } finally {
      setPaying(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.phoneNumber?.includes(search) ||
      customer.referralCode?.toLowerCase().includes(search.toLowerCase())
  );

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
            💵 156. Pay Commission
          </h1>
          <p style={{ color: '#6b7280' }}>
            Pay commission to eligible foremen and view payment history
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={cardStyle}>
            <ShieldCheck size={24} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.commissionEligible || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Commission Eligible</div>
          </div>
          <div style={cardStyle}>
            <DollarSign size={24} style={{ color: '#f59e0b', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              Rs. {(stats.availableCommission || 0).toFixed(0)}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Available to Pay</div>
          </div>
          <div style={cardStyle}>
            <CreditCard size={24} style={{ color: '#16a34a', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              Rs. {(stats.totalCommissionPaid || 0).toFixed(0)}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Paid</div>
          </div>
          <div style={cardStyle}>
            <Calendar size={24} style={{ color: '#3b82f6', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              Rs. {(stats.totalCommissionEarned || 0).toFixed(0)}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Earned</div>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <DollarSign size={20} style={{ color: '#059669' }} />
          <span style={{ color: '#065f46', fontSize: '14px' }}>
            Only <strong>commission eligible foremen</strong> with available balance are shown. Click on a foreman to view their payment history.
          </span>
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
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Foreman</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Total Earned</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Total Paid</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Available</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Loading foremen...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No commission eligible foremen found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <React.Fragment key={customer._id}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => toggleExpand(customer._id)}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {expandedCustomer === customer._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          <div>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>{customer.name}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{customer.phoneNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#16a34a', fontWeight: '500' }}>
                        Rs. {(customer.commissionEarned || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#6b7280' }}>
                        Rs. {(customer.commissionPaid || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          backgroundColor: customer.availableCommission > 0 ? '#dcfce7' : '#f1f5f9', 
                          color: customer.availableCommission > 0 ? '#16a34a' : '#6b7280', 
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          Rs. {(customer.availableCommission || 0).toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        {customer.availableCommission > 0 && (
                          <button
                            onClick={() => payCommission(customer._id, customer.name, customer.availableCommission)}
                            disabled={paying}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: paying ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              opacity: paying ? 0.6 : 1
                            }}
                          >
                            <DollarSign size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Pay Cash
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Payment History Dropdown */}
                    {expandedCustomer === customer._id && (
                      <tr>
                        <td colSpan="5" style={{ padding: '0', backgroundColor: '#f8fafc' }}>
                          <div style={{ padding: '16px 24px' }}>
                            <h4 style={{ marginBottom: '12px', color: '#374151', fontWeight: '600' }}>
                              📜 Payment History for {customer.name}
                            </h4>
                            {paymentHistories[customer._id]?.length > 0 ? (
                              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                                <thead>
                                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Date</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Paid By</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paymentHistories[customer._id].map((payment, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>
                                        {new Date(payment.date || payment.paidDate).toLocaleDateString()}
                                        <br />
                                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                          {new Date(payment.date || payment.paidDate).toLocaleTimeString()}
                                        </span>
                                      </td>
                                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#16a34a', fontWeight: '500', textAlign: 'right' }}>
                                        Rs. {(payment.amount || 0).toFixed(2)}
                                      </td>
                                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#374151' }}>
                                        {payment.staffSignature?.staffName || payment.paidBy || 'Admin'}
                                      </td>
                                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#6b7280' }}>
                                        {payment.notes || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', backgroundColor: '#ffffff', borderRadius: '8px' }}>
                                No payment history yet
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
