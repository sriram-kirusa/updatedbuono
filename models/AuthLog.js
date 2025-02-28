const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['signup', 'signin', 'admin-signin'], // Add 'admin-signin' to valid values
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuthLog', authLogSchema);