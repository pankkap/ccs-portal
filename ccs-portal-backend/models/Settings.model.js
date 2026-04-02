const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'system_governance'
  },
  universityName: {
    type: String,
    default: 'IILM University'
  },
  tagline: {
    type: String,
    default: 'Empowering Future Leaders'
  },
  about: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  placementStats: {
    highestPackage: { type: String, default: '18 LPA' },
    averagePackage: { type: String, default: '6.5 LPA' },
    placementRate: { type: String, default: '95%' }
  }
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

module.exports = Settings;
