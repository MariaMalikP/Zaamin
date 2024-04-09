import mongoose from 'mongoose';

const medicalInfoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  bloodType: {
    type: String,
    default: ''
    // required: trueid
  },
  allergies: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: '1122'
  },
  leaveRequest: {
    type: String,
    default: "No Leave Requested"
    // Leave Request: No Leave Requested, Leave Requested
  },
  currentLeaveStatus: {
    type: String,
    default: "Undifined"
    // Leave Status: Unverified, Approved, Rejected
  },
  medicalHistory: {
    type: String,
    default: ''
    // in this store pdfs of medical history
  }
}, { timestamps: true });

const MedicalInfo = mongoose.model('MedicalInfo',medicalInfoSchema,'MedicalInfo' );

export default MedicalInfo;