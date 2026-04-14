const express = require('express');
const {
  doctorSignup,
  patientSignup,
  doctorLogin,
  patientLogin
} = require('../Controllers/authController');
const {
  doctorSignupSchema,
  patientSignupSchema,
  loginSchema,
  validate
} = require('../Middleware/validation');

const router = express.Router();

// Doctor Auth Routes
router.post('/doctor/signup', validate(doctorSignupSchema), doctorSignup);
router.post('/doctor/login', validate(loginSchema), doctorLogin);

// Patient Auth Routes
router.post('/patient/signup', validate(patientSignupSchema), patientSignup);
router.post('/patient/login', validate(loginSchema), patientLogin);

module.exports = router;
