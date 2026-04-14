const express = require('express');
const {
  getPatientProfile,
  updatePatientProfile,
  bookAppointment,
  getPatientAppointments,
  cancelAppointment
} = require('../Controllers/patientController');
const { protect, authorize } = require('../Middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('patient'));

router.get('/profile', getPatientProfile);
router.put('/profile/update', updatePatientProfile);
router.post('/appointment', bookAppointment);
router.get('/appointments', getPatientAppointments);
router.delete('/appointment/:id', cancelAppointment);

module.exports = router;
