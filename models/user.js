const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true }, // Roll Number
  admissionNo: { type: String, required: true, unique: true }, // Admission Number
  department: { type: String, required: true }, // Department
  email: { type: String, required: true, unique: true }, // Email
  password: { type: String, required: true }, // Password
  points: { type: Number, default: 0 }, // Optional for gamification
});

module.exports = mongoose.model('User', UserSchema);
