const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  admissionNo: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  quizScore: { type: Number, default: 0 },  // Store quiz score
});

module.exports = mongoose.model('User', UserSchema);
