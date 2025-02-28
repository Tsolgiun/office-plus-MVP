const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const { updateAppointmentStatus ,cancelAppointment,getBuildingAppointments,getUserAppointments,createAppointment} = require('../controllers/appointment.controller');

// Public routes
router.post('/updateAppointmentStatus/:appointmentId',auth, updateAppointmentStatus);
router.post('/cancelAppointment/:appointmentId',auth, cancelAppointment);
router.get('/getBuildingAppointments/:buildingId',auth, getBuildingAppointments);
router.get('/getUserAppointments/:userId',auth, getUserAppointments);
router.put('/createAppointment',auth, createAppointment);

module.exports = router;
