const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get dashboard stats
// @route   GET /api/stats
const getStats = async (req, res) => {
  try {
    const [totalVenues, totalEvents, totalRegistrations] = await Promise.all([
      Venue.countDocuments(),
      Event.countDocuments(),
      Registration.countDocuments(),
    ]);

    res.json({ totalVenues, totalEvents, totalRegistrations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
