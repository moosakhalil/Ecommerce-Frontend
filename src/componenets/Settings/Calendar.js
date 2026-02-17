import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckSquare,
  X,
  Save,
  Printer,
  Download,
} from "lucide-react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { API_BASE_URL } from "../../utils/config";

const CalendarComponent = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);

  // Calculate week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Generate all 365 days for the selected year
  const generateYearData = (year) => {
    const days = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const daysInYear =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    for (let dayIndex = 0; dayIndex < daysInYear; dayIndex++) {
      const currentDate = new Date(year, 0, dayIndex + 1);
      const weekNumber = getWeekNumber(currentDate);
      const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      days.push({
        date: `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${year}`,
        weekDay: dayName,
        weekNumber: weekNumber,
        holidayName1: "",
        specificDay1: "",
        holidayName2: "",
        specificDay2: "",
        holidayName3: "",
        specificDay3: "",
        isOpen: true,
        closingHoursFrom: "",
        closingHoursTo: "",
        notes: "",
        year: year,
      });
    }

    return days;
  };

  // Load calendar data from backend
  useEffect(() => {
    loadCalendarData(selectedYear);
  }, [selectedYear]);

  const loadCalendarData = async (year) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/calendar/${year}`);
      if (response.data && response.data.length > 0) {
        setYearData(response.data);
      } else {
        setYearData(generateYearData(year));
      }
    } catch (error) {
      console.log("No saved data, generating new calendar");
      setYearData(generateYearData(year));
    }
    setLoading(false);
  };

  const changeYear = (year) => {
    setSelectedYear(year);
    setCurrentWeek(1);
  };

  const updateHolidayField = (index, field, value) => {
    const newData = [...yearData];
    newData[index][field] = value;
    setYearData(newData);
  };

  const toggleOpenStatus = (index) => {
    const newData = [...yearData];
    newData[index].isOpen = !newData[index].isOpen;
    setYearData(newData);
  };

  const updateNotes = (index, value) => {
    const newData = [...yearData];
    newData[index].notes = value;
    setYearData(newData);
  };

  const updateClosingHours = (index, field, value) => {
    const newData = [...yearData];
    newData[index][field] = value;

    // Automatically set isOpen to false if any closing hours are set
    if ((field === "closingHoursFrom" || field === "closingHoursTo") && value) {
      newData[index].isOpen = false;
    }
    // Set isOpen to true if both closing hours are cleared
    if (!newData[index].closingHoursFrom && !newData[index].closingHoursTo) {
      newData[index].isOpen = true;
    }

    setYearData(newData);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/calendar/save`, {
        year: selectedYear,
        data: yearData,
      });
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving calendar data:", error);
      alert("Failed to save changes. Please try again.");
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const weeksData = yearData; // Print all year data

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Calendar - Full Year ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #7e22ce; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #fde68a; padding: 10px; border: 1px solid #d1d5db; text-align: left; font-weight: bold; }
            td { padding: 10px; border: 1px solid #d1d5db; }
            tr:nth-child(even) { background-color: #fef3c7; }
            tr:nth-child(odd) { background-color: #fffbeb; }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <h1>Calendar - Full Year ${selectedYear}</h1>
          <table>
            <thead>
              <tr>
                <th>Week Number</th>
                <th>Date</th>
                <th>Week Day</th>
                <th>Holiday Name 1</th>
                <th>Specific Day 1</th>
                <th>Holiday Name 2</th>
                <th>Specific Day 2</th>
                <th>Holiday Name 3</th>
                <th>Specific Day 3</th>
                <th>Status</th>
                <th>Closing Hours</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${weeksData
                .map(
                  (day) => `
                <tr>
                  <td>week ${day.weekNumber}</td>
                  <td>${day.date}</td>
                  <td>${day.weekDay}</td>
                  <td>${day.holidayName1 || "-"}</td>
                  <td>${day.specificDay1 || "-"}</td>
                  <td>${day.holidayName2 || "-"}</td>
                  <td>${day.specificDay2 || "-"}</td>
                  <td>${day.holidayName3 || "-"}</td>
                  <td>${day.specificDay3 || "-"}</td>
                  <td>${day.isOpen ? "Open" : "Closed"}</td>
                  <td>${day.closingHoursFrom && day.closingHoursTo ? `${day.closingHoursFrom} - ${day.closingHoursTo}` : "-"}</td>
                  <td>${day.notes || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Week Number,Date,Week Day,Holiday Name 1,Specific Day 1,Holiday Name 2,Specific Day 2,Holiday Name 3,Specific Day 3,Closed or Open,Text Box\n" +
      yearData
        .map(
          (day) =>
            `${day.weekNumber},${day.date},${day.weekDay},${day.holidayName1 || ""},${day.specificDay1 || ""},${day.holidayName2 || ""},${day.specificDay2 || ""},${day.holidayName3 || ""},${day.specificDay3 || ""},${day.isOpen ? "Open" : "Closed"},${day.notes}`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `calendar_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-h-screen p-6">
        <div className="max-w-[1600px] mx-auto">
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-700 font-medium">
                  Loading calendar data...
                </p>
              </div>
            </div>
          )}
          {/* Header with Actions */}
          <div className="bg-purple-700 text-white p-4 rounded-lg mb-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Calendar className="mr-2" size={24} />
                  <h1 className="text-2xl font-semibold">
                    <strong>116.</strong> Calendar
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center gap-2 bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Year Selection Buttons */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex gap-3 justify-center flex-wrap">
              {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                <button
                  key={year}
                  onClick={() => changeYear(year)}
                  className={`px-8 py-2 rounded-lg font-semibold transition-all ${
                    selectedYear === year
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              <table className="w-full border-collapse">
                <thead className="bg-yellow-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap"
                      style={{ width: "6%" }}
                    >
                      Week #
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap"
                      style={{ width: "7%" }}
                    >
                      Date
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap"
                      style={{ width: "7%" }}
                    >
                      Day
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-purple-200"
                      style={{ width: "8%" }}
                    >
                      Holiday 1
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-purple-200"
                      style={{ width: "7%" }}
                    >
                      Specific Day 1
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-green-200"
                      style={{ width: "8%" }}
                    >
                      Holiday 2
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-green-200"
                      style={{ width: "7%" }}
                    >
                      Specific Day 2
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-200"
                      style={{ width: "8%" }}
                    >
                      Holiday 3
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-200"
                      style={{ width: "7%" }}
                    >
                      Specific Day 3
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap"
                      style={{ width: "6%" }}
                    >
                      Status
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300"
                      style={{ width: "10%" }}
                    >
                      Closing Hours
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300"
                      style={{ width: "12%" }}
                    >
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {yearData
                    .map((day, origIndex) => ({ day, origIndex }))
                    .map(({ day, origIndex }, displayIndex) => (
                      <tr
                        key={origIndex}
                        className={
                          displayIndex % 2 === 0
                            ? "bg-yellow-50"
                            : "bg-yellow-100"
                        }
                      >
                        <td className="px-3 py-3 text-xl font-medium text-gray-900 border border-gray-300 whitespace-nowrap">
                          week {day.weekNumber}
                        </td>
                        <td className="px-3 py-3 text-xl text-gray-700 border border-gray-300 whitespace-nowrap">
                          {day.date}
                        </td>
                        <td className="px-3 py-3 text-xl text-gray-700 border border-gray-300 capitalize whitespace-nowrap">
                          {day.weekDay}
                        </td>
                        <td className="px-3 py-3 border border-gray-300 bg-purple-50">
                          <input
                            type="text"
                            value={day.holidayName1 || ""}
                            onChange={(e) =>
                              updateHolidayField(
                                origIndex,
                                "holidayName1",
                                e.target.value,
                              )
                            }
                            placeholder="Holiday 1"
                            className="border border-blue-300 rounded px-3 py-2 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </td>
                        <td className="px-3 py-3 border border-gray-300 bg-purple-50">
                          <input
                            type="text"
                            value={day.specificDay1 || ""}
                            onChange={(e) =>
                              updateHolidayField(
                                origIndex,
                                "specificDay1",
                                e.target.value,
                              )
                            }
                            placeholder="Specific Day 1"
                            className="border border-blue-300 rounded px-3 py-2 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </td>
                        <td className="px-3 py-3 border border-gray-300 bg-green-50">
                          <input
                            type="text"
                            value={day.holidayName2 || ""}
                            onChange={(e) =>
                              updateHolidayField(
                                origIndex,
                                "holidayName2",
                                e.target.value,
                              )
                            }
                            placeholder="Holiday 2"
                            className="border border-blue-300 rounded px-3 py-2 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </td>
                        <td className="px-3 py-3 border border-gray-300 bg-green-50">
                          <input
                            type="text"
                            value={day.specificDay2 || ""}
                            onChange={(e) =>
                              updateHolidayField(
                                origIndex,
                                "specificDay2",
                                e.target.value,
                              )
                            }
                            placeholder="Specific Day 2"
                            className="border border-blue-300 rounded px-3 py-2 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </td>
                        <td className="px-3 py-3 border border-gray-300 bg-blue-50">
                          <input
                            type="text"
                            value={day.holidayName3 || ""}
                            onChange={(e) =>
                              updateHolidayField(
                                origIndex,
                                "holidayName3",
                                e.target.value,
                              )
                            }
                            placeholder="Holiday 3"
                            className="border border-blue-300 rounded px-3 py-2 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </td>
                        <td className="px-3 py-3 border border-gray-300 bg-blue-50">
                          <input
                            type="text"
                            value={day.specificDay3 || ""}
                            onChange={(e) =>
                              updateHolidayField(
                                origIndex,
                                "specificDay3",
                                e.target.value,
                              )
                            }
                            placeholder="Specific Day 3"
                            className="border border-blue-300 rounded px-3 py-2 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </td>
                        <td className="px-3 py-3 border border-gray-300">
                          <button
                            onClick={() => toggleOpenStatus(origIndex)}
                            className="flex items-center justify-center w-full hover:bg-white hover:bg-opacity-50 rounded px-2 py-1 transition-colors"
                          >
                            {day.isOpen ? (
                              <CheckSquare className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )}
                            <span className="ml-2 text-sm font-medium whitespace-nowrap">
                              {day.isOpen ? "Open" : "Closed"}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 py-3 border border-gray-300">
                          <div className="flex gap-2 items-center">
                            <div className="flex flex-col flex-1">
                              <label className="text-xl text-gray-600 mb-1">
                                From
                              </label>
                              <input
                                type="time"
                                value={day.closingHoursFrom || ""}
                                onChange={(e) =>
                                  updateClosingHours(
                                    origIndex,
                                    "closingHoursFrom",
                                    e.target.value,
                                  )
                                }
                                className="border border-blue-300 rounded px-2 py-1 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              <label className="text-xl text-gray-600 mb-1">
                                To
                              </label>
                              <input
                                type="time"
                                value={day.closingHoursTo || ""}
                                onChange={(e) =>
                                  updateClosingHours(
                                    origIndex,
                                    "closingHoursTo",
                                    e.target.value,
                                  )
                                }
                                className="border border-blue-300 rounded px-2 py-1 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 border border-gray-300">
                          <input
                            type="text"
                            value={day.notes || ""}
                            onChange={(e) =>
                              updateNotes(origIndex, e.target.value)
                            }
                            placeholder="Notes"
                            className="border border-blue-300 rounded px-3 py-2 text-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
