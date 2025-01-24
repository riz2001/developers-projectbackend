const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scored: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Score = mongoose.model('Score', scoreSchema);
module.exports = Score; // Ensure this line is correct
