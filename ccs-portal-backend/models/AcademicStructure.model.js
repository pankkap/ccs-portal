const mongoose = require('mongoose');

const academicStructureSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['School', 'Department', 'Year'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicStructure',
    default: null // Departments link to Schools
  }
}, { timestamps: true });

const AcademicStructure = mongoose.models.AcademicStructure || mongoose.model('AcademicStructure', academicStructureSchema);

module.exports = AcademicStructure;
