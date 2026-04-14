const express = require('express');
const {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription,
  getAllDoctors
} = require('../Controllers/doctorController');
const { protect, authorize } = require('../Middleware/auth');

const router = express.Router();

// Public route - list all doctors (for booking page)
router.get('/', getAllDoctors);

// Protected doctor routes
router.use(protect);
router.use(authorize('doctor'));

router.get('/profile', getDoctorProfile);
router.put('/profile/update', updateDoctorProfile);
router.get('/appointments', getDoctorAppointments);
router.put('/appointment/:id/status', updateAppointmentStatus);
router.post('/appointment/:id/prescription', addPrescription);

module.exports = router;
