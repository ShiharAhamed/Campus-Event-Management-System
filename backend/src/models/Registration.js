const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  email: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema);
