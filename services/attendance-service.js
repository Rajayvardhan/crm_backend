const Attendance = require('../models/attendance-model');

class AttendanceService {
  
  markAttendance = async (data) => Attendance.create(data);

  findAttendance = async (data) => Attendance.findOne(data);

  findAllAttendance = async (data) => Attendance.find(data).populate('employeeID', 'name email'); // populate name and email only

  updateAttendance = async (id, data) => Attendance.findByIdAndUpdate(id, data, { new: true });


  // 🟡 Holiday logic directly in service
  isHoliday = (date) => {
    const holidayCalendar = [
      "2025-04-27", // Labor Day
      "2025-08-15", // Independence Day
      
      // ✅ Add more static holidays here if needed
    ];

    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dateNum = date.getDate();
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

    // Static calendar holiday
    if (holidayCalendar.includes(formattedDate)) return true;

    // Sunday
    if (day === 0) return true;

    // 2nd & 4th Saturday
    if (day === 6) {
      const week = Math.floor((dateNum - 1) / 7) + 1;
      return week === 2 || week === 4;
    }

    return false;
  };
}

module.exports = new AttendanceService();
