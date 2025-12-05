// ReferralProfit.js
import React, { useState } from "react";
import { Search, Filter, MoreVertical } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { useNavigate } from "react-router-dom";

const DUMMY_PROFITS = [
  {
    id: "1A",
    name: "Ali",
    earning: "12$",
    from: "Referral",
    date: "4.12.2024",
    totalEarned: "13$",
    wallet: "13$",
  },
  {
    id: "2B",
    name: "David",
    earning: "13$",
    from: "123B",
    date: "4.12.2024",
    totalEarned: "13$",
    wallet: "13$",
  },
  {
    id: "3C",
    name: "Frisky",
    earning: "14$",
    from: "123C",
    date: "4.12.2024",
    totalEarned: "14$",
    wallet: "14$",
  },
];

const TIME_FILTERS = ["Today", "This week", "This month"];

export default function ReferralProfit() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("Today");
  const [menuOpen, setMenuOpen] = useState(null);

  const filtered = DUMMY_PROFITS.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-6`}
      >
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-4">Referrals profit</h1>

        {/* Search + Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded p-2 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -mt-2 text-gray-400 cursor-pointer" />
          </div>
          <button className="ml-4 flex items-center border rounded px-4 py-2 bg-white">
            <span>Filter</span>
            <Filter className="ml-2" />
          </button>
        </div>

        {/* Time Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-6 py-2 rounded ${
                timeFilter === tf ? "bg-green-100" : "bg-white border"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Foreman ID",
                  "Foreman name",
                  "Earning",
                  "Earning from where?",
                  "Earned on",
                  "Total amount earned till date",
                  "How much in wallet?",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((r, idx) => (
                <tr key={r.id} className={idx % 2 ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.name}</td>
                  <td className="px-6 py-4 text-sm text-blue-600">
                    {r.earning}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.from}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.totalEarned}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.wallet}
                  </td>
                  <td className="px-6 py-4 relative">
                    <MoreVertical
                      className="cursor-pointer"
                      onClick={() => setMenuOpen(menuOpen === idx ? null : idx)}
                    />
                    {menuOpen === idx && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                          View Wallet
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 text-right text-sm text-gray-600">
            1 out of 20
          </div>
        </div>
      </div>
    </div>
  );
}
