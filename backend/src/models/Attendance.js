const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  studentId: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
