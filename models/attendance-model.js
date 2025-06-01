const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  employeeID: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  year: { type: Number, required: true },
  month: { type: Number, required: true },
  date: { type: Number, required: true },
  day: { type: String, required: true },

  inTime: { type: Date, default: null },
  outTime: { type: Date, default: null },

  inApproved: { type: Boolean, default: false },
  outApproved: { type: Boolean, default: false },

  present: { type: String, enum: ['Present', 'Half-day', 'Absent'], default: 'Absent' },

  regularized: { type: Boolean, default: false },
  regularizeType: { type: String, enum: ['IN', 'OUT', null], default: null },
  regularizeReason: { type: String, default: null },
  hrRemarks: { type: String, default: null },

  halfDay: { type: Boolean, default: false },
  holiday: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
