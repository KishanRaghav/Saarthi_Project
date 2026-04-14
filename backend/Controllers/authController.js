const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const generateToken = require('../utils/generateToken');
const ErrorResponse = require('../utils/errorResponse');

const doctorSignup = async (req, res, next) => {
  try {
    const { name, email, password, specialization, experience } = req.body;
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return next(new ErrorResponse('Doctor already exists', 400));
    }
    const doctor = await Doctor.create({
      name,
      email,
      password,
      specialization,
      experience: experience || 0
    });

    const token = generateToken(doctor._id, 'doctor');

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: doctor.experience
      }
    });
  } catch (error) {
    next(error);
  }
};
const patientSignup = async (req, res, next) => {
  try {
    const { name, email, password, age, gender } = req.body;
    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return next(new ErrorResponse('Patient already exists', 400));
    }
    const patient = await Patient.create({
      name,
      email,
      password,
      age,
      gender: gender || 'other'
    });
    const token = generateToken(patient._id, 'patient');

    res.status(201).json({
      success: true,
      message: 'Patient account created successfully',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender
      }
    });
  } catch (error) {
    next(error);
  }
};
const doctorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

   
    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor || !(await doctor.matchPassword(password))) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    res.json({
      success: true,
      message: 'Doctor login successful',
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: doctor.experience
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Patient Login
// @route   POST /api/auth/patient/login
const patientLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for patient
    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient || !(await patient.matchPassword(password))) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate token
    const token = generateToken(patient._id, 'patient');

    res.json({
      success: true,
      message: 'Patient login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  doctorSignup,
  patientSignup,
  doctorLogin,
  patientLogin
};