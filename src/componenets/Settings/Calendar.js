import React, { useState } from "react";
import { Calendar, CheckSquare, X } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const CalendarComponent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Generate weeks data for the current year
  const generateWeeksData = () => {
    const weeks = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Create data for 17 weeks
    for (let weekNum = 1; weekNum <= 17; weekNum++) {
      // Calculate the date for Monday of each week
      // Week 1 starts from the first Monday of the year
      const firstDayOfYear = new Date(currentYear, 0, 1);
      const dayOfWeek = firstDayOfYear.getDay();
      const daysToAdd =
        (dayOfWeek === 0 ? 1 : 8 - dayOfWeek) + (weekNum - 1) * 7;
      const weekDate = new Date(currentYear, 0, daysToAdd);

      weeks.push({
        weekNumber: weekNum,
        date: `${weekDate.getDate()}/${weekDate.getMonth() + 1}/${currentYear}`,
        weekDay: "monday", // Always Monday as per the image
        holiday: "",
        closedOrOpen: true,
        textBox: "",
      });
    }

    return weeks;
  };

  const [weeksData, setWeeksData] = useState(generateWeeksData());

  const updateHoliday = (index, value) => {
    const newData = [...weeksData];
    newData[index].holiday = value;
    setWeeksData(newData);
  };

  const toggleOpenStatus = (index) => {
    const newData = [...weeksData];
    newData[index].closedOrOpen = !newData[index].closedOrOpen;
    setWeeksData(newData);
  };

  const updateTextBox = (index, value) => {
    const newData = [...weeksData];
    newData[index].textBox = value;
    setWeeksData(newData);
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
            <h1 className="text-xl font-semibold">Calendar</h1>
          </div>
          <div className="flex space-x-2">
            <button className="bg-purple-800 px-3 py-1 rounded-md text-sm">
              Export
            </button>
            <button className="bg-purple-800 px-3 py-1 rounded-md text-sm">
              Print
            </button>
          </div>
        </div>

        {/* Calendar Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-yellow-200 border border-gray-300">
                    Week Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-yellow-200 border border-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-yellow-200 border border-gray-300">
                    Week Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-yellow-200 border border-gray-300">
                    Holiday Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-yellow-200 border border-gray-300">
                    Closed or Open
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-yellow-200 border border-gray-300">
                    Text Box
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weeksData.map((week, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? "bg-yellow-50" : "bg-yellow-100"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                      week {week.weekNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                      {week.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                      {week.weekDay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                      <input
                        type="text"
                        value={week.holiday}
                        onChange={(e) => updateHoliday(index, e.target.value)}
                        placeholder="Enter holiday name"
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                      <button
                        onClick={() => toggleOpenStatus(index)}
                        className="flex items-center justify-center"
                      >
                        {week.closedOrOpen ? (
                          <CheckSquare className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                        <span className="ml-2 text-sm">
                          {week.closedOrOpen ? "Open" : "Closed"}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                      <input
                        type="text"
                        value={week.textBox}
                        onChange={(e) => updateTextBox(index, e.target.value)}
                        placeholder="Enter text here"
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            Save Changes
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
