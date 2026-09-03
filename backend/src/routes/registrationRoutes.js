const express = require('express');
const router = express.Router();
const {
  getRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
} = require('../controllers/registrationController');

// GET /api/registrations?eventId=<id>   — supports event filter
router.route('/').get(getRegistrations).post(createRegistration);
router.route('/:id').get(getRegistrationById).put(updateRegistration).delete(deleteRegistration);

module.exports = router;
