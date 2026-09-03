const express = require('express');
const router = express.Router();
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');

router.route('/').get(getVenues).post(createVenue);
router.route('/:id').get(getVenueById).put(updateVenue).delete(deleteVenue);

module.exports = router;
