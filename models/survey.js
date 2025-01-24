const mongoose = require('mongoose');

// Survey Schema to store responses
const surveySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to User model
  usageFrequency: { type: String },
  healthRiskAwareness: { type: String },
  alternativesUsed: { type: String },
  environmentalConcern: { type: Number },
  challenges: [{ type: String }],
  supportTechSolutions: { type: String },
  motivation: { type: String },
  additionalFeedback: { type: String },
});

module.exports = mongoose.model('Survey', surveySchema);
