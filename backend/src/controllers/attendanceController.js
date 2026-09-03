const Attendance = require('../models/Attendance');

// @desc    Get attendance for an event
// @route   GET /api/events/:id/attendance
const getAttendanceByEvent = async (req, res) => {
  try {
    const attendance = await Attendance.find({ eventId: req.params.id });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance for an event
// @route   POST /api/events/:id/attendance
const markAttendance = async (req, res) => {
  try {
    const attendance = new Attendance({
      ...req.body,
      eventId: req.params.id
    });
    const savedAttendance = await attendance.save();
    res.status(201).json(savedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAttendanceByEvent, markAttendance };
