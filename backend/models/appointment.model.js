const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  building: {
    type: Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  room: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  attendees: {
    type: Number,
    required: true,
    default: 1
  },
  contactInfo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

appointmentSchema.index(
    { 
      building: 1, 
      room: 1, 
      status: 1,
      startTime: 1, 
      endTime: 1 
    }, 
    { 
      name: "building_room_time_idx" 
    }
  );
module.exports = mongoose.model('Appointment', appointmentSchema);