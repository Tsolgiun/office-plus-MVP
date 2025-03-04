const Appointment = require('../models/appointment.model');
const Building = require('../models/building.model');

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    // Log the received data for debugging
    console.log('Received appointment data:', req.body);
    
    // Create new appointment - use req.body directly since our models now match
    const appointment = new Appointment({
      userId: req.body.userId,
      building: req.body.building,
      room: req.body.room,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      purpose: req.body.purpose,
      attendees: req.body.attendees,
      contactInfo: req.body.contactInfo,
      status: 'pending'
    });

    // Save the appointment
    const savedAppointment = await appointment.save();
    
    return res.status(201).json({
      success: true,
      appointment: savedAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Get all appointments for a user
const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const appointments = await Appointment.find({ userId: userId })
      
      .sort({ startTime: 1 });
    
    return res.json({
      success: true,
      appointments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// Get all appointments for a building
const getBuildingAppointments = async (req, res) => {
  try {
    const { buildingId } = req.params;
    
    const appointments = await Appointment.find({ 
      building: buildingId, 
    }).populate('userId', 'name email');
    
    return res.json({
      success: true,
      appointments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching building appointments',
      error: error.message
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    return res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getBuildingAppointments,
  updateAppointmentStatus,
  cancelAppointment
};