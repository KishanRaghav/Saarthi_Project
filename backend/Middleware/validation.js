const Joi = require('joi');

const doctorSignupSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  specialization: Joi.string().max(50).required(),
  experience: Joi.number().min(0).optional()
});

const patientSignupSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().min(0).max(120).required(),
  gender: Joi.string().valid('male', 'female', 'other').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

module.exports = {
  doctorSignupSchema,
  patientSignupSchema,
  loginSchema,
  validate
};