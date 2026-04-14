const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const ErrorResponse = require('../utils/errorResponse');

const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.user.id);
    res.json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        createdAt: patient.createdAt
      }
    });
  } catch (error) { next(error); }
};

const updatePatientProfile = async (req, res, next) => {
  try {
    const updates = { name: req.body.name, age: req.body.age, gender: req.body.gender };
    const patient = await Patient.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', patient });
  } catch (error) { next(error); }
};

const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date } = req.body;
    if (!doctorId || !date) return next(new ErrorResponse('Doctor ID and date are required', 400));

    // ✅ FIXED: was Patient.findById — should be Doctor.findById
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new ErrorResponse('Doctor not found', 404));

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      patientId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingAppointment) {
      return next(new ErrorResponse('You already have an appointment with this doctor on this date', 400));
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user.id,
      date: new Date(date)
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name email specialization experience');

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: populated });
  } catch (error) { next(error); }
};

const getPatientAppointments = async (req, res, next) => {
  try {
    const filter = { patientId: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name email specialization experience')
      .sort({ date: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) { next(error); }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user.id,
      status: 'pending'
    });
    if (!appointment) return next(new ErrorResponse('Appointment not found or cannot be cancelled', 404));
    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) { next(error); }
};

module.exports = { getPatientProfile, updatePatientProfile, bookAppointment, getPatientAppointments, cancelAppointment };
