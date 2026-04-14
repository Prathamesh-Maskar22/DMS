// src/controllers/masters.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to handle try/catch for all controllers
const handleController = async (res, prismaPromise) => {
  try {
    const data = await prismaPromise;
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching masters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
    });
  }
};

export const getAllVehicles = async (req, res) => {
  // Includes modelType and vertical just in case you want to show them in the dropdown later
  handleController(
    res,
    prisma.vehicle.findMany({
      where: { is_active: true },
      include: {
        modelType: { select: { model_name: true } },
        vertical: { select: { vertical_name: true } },
      },
      orderBy: { vehicle_number: 'asc' },
    })
  );
};

export const getAllDrivers = async (req, res) => {
  handleController(
    res,
    prisma.driver.findMany({
      where: { is_active: true },
      orderBy: { driver_name: 'asc' },
    })
  );
};

export const getAllCities = async (req, res) => {
  handleController(
    res,
    prisma.city.findMany({
      where: { is_active: true },
      orderBy: { city_name: 'asc' },
    })
  );
};

export const getAllPumps = async (req, res) => {
  handleController(
    res,
    prisma.pump.findMany({
      where: { is_active: true },
      orderBy: { pump_name: 'asc' },
    })
  );
};

export const getAllCustomers = async (req, res) => {
  handleController(
    res,
    prisma.customer.findMany({
      where: { is_active: true },
      orderBy: { customer_name: 'asc' },
    })
  );
};

export const getAllExtraRemarks = async (req, res) => {
  handleController(
    res,
    prisma.extraDieselRemark.findMany({
      where: { is_active: true },
      orderBy: { remark_text: 'asc' },
    })
  );
};

export const getAllApprovers = async (req, res) => {
  handleController(
    res,
    prisma.extraDieselApprover.findMany({
      where: { is_active: true },
      orderBy: { approver_name: 'asc' },
    })
  );
};

export const getAllRoutes = async (req, res) => {
  // Included this because your form has route_id, but your fetch array missed it
  handleController(
    res,
    prisma.route.findMany({
      where: { is_active: true },
      include: {
        fromCity: { select: { city_name: true } },
        toCity: { select: { city_name: true } },
      },
      orderBy: { route_code: 'asc' },
    })
  );
};

// Models that support soft delete (have is_active column)
const softDeleteModels = [
  'vehicles', 'drivers', 'cities', 'pumps', 'customers',
  'extra-remarks', 'approvers', 'routes'
];

const modelMap = {
  vehicles: prisma.vehicle,
  drivers: prisma.driver,
  cities: prisma.city,
  pumps: prisma.pump,
  customers: prisma.customer,
  'extra-remarks': prisma.extraDieselRemark,
  approvers: prisma.extraDieselApprover,
  routes: prisma.route,
  'vehicle-model-types': prisma.vehicleModelType,     // ← NEW
  'vehicle-verticals': prisma.vehicleVertical,        // ← NEW
};

export const getAllMasters = (modelName) => async (req, res) => {
  try {
    const query = {
      orderBy: { created_at: 'desc' },
    };

    // Only apply is_active filter to models that actually have the column
    if (softDeleteModels.includes(modelName)) {
      query.where = { is_active: true };
    }

    // Add relations for better display
    if (modelName === 'vehicles') {
      query.include = { modelType: true, vertical: true };
    }
    if (modelName === 'routes') {
      query.include = { fromCity: true, toCity: true };
    }

    const data = await modelMap[modelName].findMany(query);

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createMaster = (modelName) => async (req, res) => {
  try {
    const data = await modelMap[modelName].create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateMaster = (modelName) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = await modelMap[modelName].update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const softDeleteMaster = (modelName) => async (req, res) => {
  try {
    const { id } = req.params;
    await modelMap[modelName].update({
      where: { id: Number(id) },
      data: { is_active: false },
    });
    res.json({ success: true, message: 'Record soft deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};