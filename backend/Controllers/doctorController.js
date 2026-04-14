const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const ErrorResponse = require('../utils/errorResponse');

// Public: list all doctors for booking page
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) { next(error); }
};

const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    res.json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: doctor.experience,
        createdAt: doctor.createdAt
      }
    });
  } catch (error) { next(error); }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const updates = { name: req.body.name, specialization: req.body.specialization, experience: req.body.experience };
    const doctor = await Doctor.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', doctor });
  } catch (error) { next(error); }
};

const getDoctorAppointments = async (req, res, next) => {
  try {
    const filter = { doctorId: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email age gender')
      .sort({ date: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) { next(error); }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) return next(new ErrorResponse('Invalid status', 400));

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.id },
      { status },
      { new: true }
    ).populate('patientId', 'name email age gender');

    if (!appointment) return next(new ErrorResponse('Appointment not found', 404));
    res.json({ success: true, message: `Status updated to ${status}`, data: appointment });
  } catch (error) { next(error); }
};

const addPrescription = async (req, res, next) => {
  try {
    const { prescription, notes } = req.body;
    if (!prescription?.trim()) return next(new ErrorResponse('Prescription is required', 400));

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.id },
      { prescription: prescription.trim(), notes: notes?.trim() || '', status: 'completed' },
      { new: true }
    ).populate('patientId', 'name email age gender');

    if (!appointment) return next(new ErrorResponse('Appointment not found', 404));
    res.json({ success: true, message: 'Prescription added', data: appointment });
  } catch (error) { next(error); }
};

module.exports = { getAllDoctors, getDoctorProfile, updateDoctorProfile, getDoctorAppointments, updateAppointmentStatus, addPrescription };
