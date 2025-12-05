import React, { useState } from "react";
import { Calendar, ArrowUp, DollarSign, Tag } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const SalesData = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("daily");

  // Dummy data for daily sales
  const [dailySalesData, setDailySalesData] = useState([
    {
      date: "1/April",
      amount: 12,
      day: "monday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "2/April",
      amount: 15,
      day: "tuesday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "3/April",
      amount: 9,
      day: "wednesday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "4/April",
      amount: 18,
      day: "thursday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "5/April",
      amount: 14,
      day: "friday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "6/April",
      amount: 22,
      day: "saturday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "7/April",
      amount: 12,
      day: "sunday",
      holiday: "",
      checked: false,
      isOpen: false,
    },
    {
      date: "8/April",
      amount: 16,
      day: "monday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "9/April",
      amount: 20,
      day: "tuesday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "10/April",
      amount: 25,
      day: "wednesday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "11/April",
      amount: 19,
      day: "thursday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "12/April",
      amount: 21,
      day: "friday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
    {
      date: "13/April",
      amount: 28,
      day: "saturday",
      holiday: "",
      checked: false,
      isOpen: true,
    },
  ]);

  // Weekly sales data
  const weeklySalesData = [
    {
      week: "Week 1",
      dateFrom: "6 April",
      dateTo: "13 April",
      totalSales: 102,
      averagePerDay: 14.57,
    },
    {
      week: "Week 2",
      dateFrom: "14 April",
      dateTo: "20 April",
      totalSales: 135,
      averagePerDay: 19.29,
    },
    {
      week: "Week 3",
      dateFrom: "21 April",
      dateTo: "27 April",
      totalSales: 98,
      averagePerDay: 14.0,
    },
    {
      week: "Week 4",
      dateFrom: "28 April",
      dateTo: "4 May",
      totalSales: 115,
      averagePerDay: 16.43,
    },
  ];

  // Top 10 sales days
  const topSalesDays = [...dailySalesData]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const toggleCheckbox = (index) => {
    const newData = [...dailySalesData];
    newData[index].checked = !newData[index].checked;
    setDailySalesData(newData);
  };

  const toggleOpenStatus = (index) => {
    const newData = [...dailySalesData];
    newData[index].isOpen = !newData[index].isOpen;
    setDailySalesData(newData);
  };

  const updateHoliday = (index, value) => {
    const newData = [...dailySalesData];
    newData[index].holiday = value;
    setDailySalesData(newData);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-4`}
      >
        {/* Header */}
        <div className="bg-purple-700 text-white p-4 flex justify-between items-center rounded-lg mb-6">
          <div className="flex items-center">
            <Calendar className="mr-2" size={20} />
            <h1 className="text-xl font-semibold">Sales Data</h1>
          </div>
          <div className="flex space-x-2">
            <button className="bg-purple-800 px-3 py-1 rounded-md text-sm">
              Export
            </button>
            <button className="bg-purple-800 px-3 py-1 rounded-md text-sm">
              Filter by date range
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <p className="text-2xl font-bold">450</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <ArrowUp className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Best Day</p>
                <p className="text-2xl font-bold">13/April</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Tag className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Average Daily</p>
                <p className="text-2xl font-bold">16.1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                className={`py-3 px-6 ${
                  activeTab === "daily"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("daily")}
              >
                Daily Sales
              </button>
              <button
                className={`py-3 px-6 ${
                  activeTab === "weekly"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("weekly")}
              >
                Weekly Summary
              </button>
              <button
                className={`py-3 px-6 ${
                  activeTab === "top10"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("top10")}
              >
                Top 10 Sales Days
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === "daily" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Take Out From Calculation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Holiday Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day of Week
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Open/Closed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailySalesData.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {day.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {day.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={day.checked}
                            onChange={() => toggleCheckbox(index)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={day.holiday}
                            onChange={(e) =>
                              updateHoliday(index, e.target.value)
                            }
                            placeholder="Enter holiday name"
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {day.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2 text-sm text-gray-700">
                              {day.isOpen ? "Open" : "Closed"}
                            </span>
                            <button
                              onClick={() => toggleOpenStatus(index)}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                                day.isOpen ? "bg-purple-600" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  day.isOpen ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "weekly" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Per Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weeklySalesData.map((week, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {week.week}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {week.dateFrom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {week.dateTo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {week.totalSales}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {week.averagePerDay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              week.totalSales > 120
                                ? "bg-green-100 text-green-800"
                                : week.totalSales > 100
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {week.totalSales > 120
                              ? "Excellent"
                              : week.totalSales > 100
                              ? "Good"
                              : "Average"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "top10" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Holiday Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topSalesDays.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {day.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {day.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {day.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={day.holiday}
                            onChange={(e) => {
                              // Find the original index in dailySalesData
                              const originalIndex = dailySalesData.findIndex(
                                (d) => d.date === day.date
                              );
                              if (originalIndex !== -1) {
                                updateHoliday(originalIndex, e.target.value);
                              }
                            }}
                            placeholder="Enter holiday name"
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Previous</span>
              &larr;
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-purple-50 text-sm font-medium text-purple-700 hover:bg-gray-50"
            >
              1
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              2
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              3
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              4
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              5
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Next</span>
              &rarr;
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SalesData;
