import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

const WalletManagement = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  
  // Form states
  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    description: "",
    category: "credit"
  });
  
  const [createForm, setCreateForm] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    initialBalance: 0
  });

  const creditCategories = [
    { value: 'credit', label: 'Credit' },
    { value: 'refund', label: 'Refund' },
    { value: 'commission', label: 'Commission' },
    { value: 'cashback', label: 'Cashback' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'insurance_claim', label: 'Insurance Claim' },
    { value: 'foreman_earnings', label: 'Foreman Earnings' },
    { value: 'last_point_discount', label: 'Last Point Discount' }
  ];

  const debitCategories = [
    { value: 'order_payment', label: 'Order Payment' },
    { value: 'adjustment', label: 'Adjustment' }
  ];

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchWallets = async (search = "") => {
    try {
      setLoading(true);
      const url = search 
        ? `${API_BASE_URL}/api/wallets?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/api/wallets`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setWallets(data.data);
      } else {
        setError(data.message || "Failed to fetch wallets");
      }
    } catch (err) {
      console.error("Error fetching wallets:", err);
      setError("Network error or server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWallets(searchTerm);
  };

  const viewWalletDetails = async (walletId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallets/${walletId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedWallet(data.data);
        setShowViewModal(true);
      } else {
        setError(data.message || "Failed to load wallet details");
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
      setError("Failed to load wallet details");
    }
  };

  const openCreditModal = (wallet) => {
    setSelectedWallet(wallet);
    setTransactionForm({ amount: "", description: "", category: "credit" });
    setShowCreditModal(true);
  };

  const openDebitModal = (wallet) => {
    setSelectedWallet(wallet);
    setTransactionForm({ amount: "", description: "", category: "order_payment" });
    setShowDebitModal(true);
  };

  const handleAddCredit = async (e) => {
    e.preventDefault();
    
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wallets/${selectedWallet._id}/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(transactionForm.amount),
          description: transactionForm.description,
          category: transactionForm.category,
          performedBy: "Admin"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        setShowCreditModal(false);
        fetchWallets(searchTerm);
        if (showViewModal) {
          viewWalletDetails(selectedWallet._id);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error adding credit:", err);
      setError("Failed to add credit");
    }
  };

  const handleDeductBalance = async (e) => {
    e.preventDefault();
    
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wallets/${selectedWallet._id}/debit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(transactionForm.amount),
          description: transactionForm.description,
          category: transactionForm.category,
          performedBy: "Admin"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        setShowDebitModal(false);
        fetchWallets(searchTerm);
        if (showViewModal) {
          viewWalletDetails(selectedWallet._id);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error deducting balance:", err);
      setError("Failed to deduct balance");
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    
    if (!createForm.customerName) {
      setError("Customer name is required");
      return;
    }

    try {
      // Generate a unique customerId if not provided
      const walletData = {
        ...createForm,
        customerId: createForm.customerId || `CUST-${Date.now()}`
      };

      const response = await fetch(`${API_BASE_URL}/api/wallets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walletData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Wallet created successfully");
        setShowCreateModal(false);
        setCreateForm({
          customerId: "",
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          initialBalance: 0
        });
        fetchWallets();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error creating wallet:", err);
      setError("Failed to create wallet");
    }
  };

  const formatCurrency = (amount) => {
    return `RP ${(amount || 0).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full transition-all duration-300 lg:ml-80">
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">💳 Wallet Management</h1>
                <p className="text-gray-600">Manage customer wallet balances and transactions</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Create Wallet
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> {success}</span>
              </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🔍 Search
              </button>
            </form>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wallets.length > 0 ? (
                        wallets.map((wallet) => (
                          <tr key={wallet._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {wallet.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {wallet.customerPhone || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <span className={`font-semibold ${wallet.balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {formatCurrency(wallet.balance)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(wallet.updatedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => viewWalletDetails(wallet._id)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="View Details"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => openCreditModal(wallet)}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  title="Add Credit"
                                >
                                  💰
                                </button>
                                <button
                                  onClick={() => openDebitModal(wallet)}
                                  className="text-orange-600 hover:text-orange-800 transition-colors"
                                  title="Deduct Balance"
                                >
                                  ➖
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                            {searchTerm ? "No wallets found matching your search" : "No wallets available. Click 'Create Wallet' to add one."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    Total Wallets: {wallets.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Wallet Modal */}
      {showViewModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Wallet Details - {selectedWallet.customerName}
              </h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Balance Info */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                <p className="text-sm opacity-80">Current Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(selectedWallet.balance)}</p>
                <p className="text-xs mt-2 opacity-70">
                  Last Updated: {new Date(selectedWallet.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => { setShowViewModal(false); openCreditModal(selectedWallet); }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add Credit
                </button>
                <button
                  onClick={() => { setShowViewModal(false); openDebitModal(selectedWallet); }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  - Deduct Balance
                </button>
              </div>

              {/* Transaction History */}
              <h3 className="text-lg font-medium mb-3">Transaction History</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedWallet.transactions && selectedWallet.transactions.length > 0 ? (
                      selectedWallet.transactions.map((txn, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(txn.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              txn.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.type === 'credit' ? '+ CREDIT' : '- DEBIT'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{txn.description}</td>
                          <td className={`px-4 py-2 text-sm text-right font-medium ${
                            txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                          No transactions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credit Modal */}
      {showCreditModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Add Credit - {selectedWallet.customerName}
              </h2>
            </div>
            <form onSubmit={handleAddCredit}>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-600">Current Balance: {formatCurrency(selectedWallet.balance)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RP)*</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={transactionForm.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setTransactionForm(prev => ({ ...prev, amount: value }));
                    }}
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason/Description*</label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Promotional credit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {creditCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                {transactionForm.amount && (
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-600">
                      New Balance: {formatCurrency(selectedWallet.balance + parseInt(transactionForm.amount || 0))}
                    </p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deduct Balance Modal */}
      {showDebitModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Deduct Balance - {selectedWallet.customerName}
              </h2>
            </div>
            <form onSubmit={handleDeductBalance}>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-600">Current Balance: {formatCurrency(selectedWallet.balance)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RP)*</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={transactionForm.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setTransactionForm(prev => ({ ...prev, amount: value }));
                    }}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason/Description*</label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Used for order payment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {debitCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                {transactionForm.amount && (
                  <div className={`p-3 rounded ${
                    parseInt(transactionForm.amount || 0) > selectedWallet.balance 
                      ? 'bg-red-50' : 'bg-orange-50'
                  }`}>
                    <p className={`text-sm ${
                      parseInt(transactionForm.amount || 0) > selectedWallet.balance 
                        ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {parseInt(transactionForm.amount || 0) > selectedWallet.balance 
                        ? 'Insufficient balance!'
                        : `New Balance: ${formatCurrency(selectedWallet.balance - parseInt(transactionForm.amount || 0))}`
                      }
                    </p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDebitModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  disabled={parseInt(transactionForm.amount || 0) > selectedWallet.balance}
                >
                  Deduct Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Create New Wallet</h2>
            </div>
            <form onSubmit={handleCreateWallet}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name*</label>
                  <input
                    type="text"
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createForm.customerPhone}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+62 812 345 6789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={createForm.customerEmail}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="customer@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance (RP)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={createForm.initialBalance}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setCreateForm(prev => ({ ...prev, initialBalance: parseInt(value) || 0 }));
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
