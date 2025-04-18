const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasPaid: { type: Boolean, default: false }  // Added hasPaid field to schema
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
