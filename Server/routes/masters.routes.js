// src/routes/masters.routes.js
import express from 'express';
import {
  getAllVehicles,
  getAllDrivers,
  getAllCities,
  getAllPumps,
  getAllCustomers,
  getAllExtraRemarks,
  getAllApprovers,
  getAllRoutes,
  getAllMasters,
  createMaster,
  updateMaster,
  softDeleteMaster,
} from '../controllers/masters.controller.js';

const router = express.Router();

// Map these URLs exactly to what is in your React fetchMasters array
router.get('/vehicles', getAllVehicles);
router.get('/drivers', getAllDrivers);
router.get('/cities', getAllCities);
router.get('/pumps', getAllPumps);
router.get('/customers', getAllCustomers);
router.get('/extra-remarks', getAllExtraRemarks);
router.get('/approvers', getAllApprovers);

const masters = ['vehicles', 'drivers', 'cities', 'pumps', 'customers', 'extra-remarks', 'approvers', 'routes'];

masters.forEach((m) => {
  router.post(`/${m}`, createMaster(m));
  router.put(`/${m}/:id`, updateMaster(m));
  router.delete(`/${m}/:id`, softDeleteMaster(m));
});
router.get('/vehicle-model-types', getAllMasters('vehicle-model-types'));  // new
router.get('/vehicle-verticals', getAllMasters('vehicle-verticals'));      // new

// Optional: Add this if you want to populate the Route dropdown in your form
router.get('/routes', getAllRoutes);

export default router;