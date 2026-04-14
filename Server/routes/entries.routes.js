// src/routes/entries.routes.js
import express from 'express';
import { createDieselEntry,getAllEntries } from '../controllers/entries.controller.js';
// Import your auth middleware here
// import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/v1/entries
router.post(
  '/', 
  // verifyToken,           // ← uncomment when auth middleware is ready
  createDieselEntry
);

// GET /api/v1/entries - Fetch all entries
router.get('/', getAllEntries); 

export default router;