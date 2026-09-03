const Venue = require('../models/Venue');

// @desc    Get all venues
// @route   GET /api/venues
const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single venue by ID
// @route   GET /api/venues/:id
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a venue
// @route   POST /api/venues
const createVenue = async (req, res) => {
  try {
    const venue = new Venue(req.body);
    const savedVenue = await venue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a venue
// @route   PUT /api/venues/:id
const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a venue
// @route   DELETE /api/venues/:id
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVenues, getVenueById, createVenue, updateVenue, deleteVenue };
