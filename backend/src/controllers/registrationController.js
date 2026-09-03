const Registration = require('../models/Registration');

// @desc    Get all registrations (optionally filter by eventId)
// @route   GET /api/registrations
// @query   ?eventId=<id>
const getRegistrations = async (req, res) => {
  try {
    const filter = req.query.eventId ? { eventId: req.query.eventId } : {};
    const registrations = await Registration.find(filter).populate('eventId', 'title date');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single registration by ID
// @route   GET /api/registrations/:id
const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId', 'title date');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a registration
// @route   POST /api/registrations
const createRegistration = async (req, res) => {
  try {
    const registration = new Registration(req.body);
    const savedRegistration = await registration.save();
    const populated = await savedRegistration.populate('eventId', 'title date');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a registration
// @route   PUT /api/registrations/:id
const updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('eventId', 'title date');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    res.json(registration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a registration
// @route   DELETE /api/registrations/:id
const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
};
