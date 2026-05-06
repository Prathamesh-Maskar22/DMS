import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Helper: Convert Prisma Decimals to Numbers for JSON response
const toJSON = (data) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      value instanceof Prisma.Decimal ? Number(value) : value
    )
  );
};

// Zod Schema - Fixed invoice_time validation
const createDieselEntrySchema = z.object({
  entry_date: z.string().optional(),
  vehicle_id: z.number().int().positive(),
  driver_id: z.number().int().positive(),
  route_id: z.number().int().positive().optional(),
  customer_id: z.number().int().positive().optional(),
  from_city_id: z.number().int().positive().optional(),
  to_city_id: z.number().int().positive().optional(),
  pump_id: z.number().int().positive().optional(),

  // Invoice Details
  invoice_number: z.string().optional(),
  // FIX: Use .transform to ensure we get null instead of null string if empty
  invoice_time: z.string().nullable().optional(),
  material_type: z.string().optional(),
  loading_weight: z.number().nonnegative().optional(),

  // Diesel & KM
  km: z.number().nonnegative().optional(),
  diesel_qty: z.number().positive(),

  // Financials
  trip_advance_amount: z.number().nonnegative().default(0),
  fooding_amount: z.number().nonnegative().default(0),
  loading_unloading_amount: z.number().nonnegative().default(0),
  kata_charges: z.number().nonnegative().default(0), // NEW
  border_charges: z.number().nonnegative().default(0), // NEW
  misc_charges: z.number().nonnegative().default(0),

  // Extra Diesel
  extra_diesel_qty: z.number().nonnegative().default(0),
  extra_diesel_remark_id: z.number().int().positive().optional(),
  approved_by_id: z.number().int().positive().optional(),

  // Cutting Diesel
  cut_diesel_qty: z.number().nonnegative().default(0),

  // Meta
  remarks: z.string().optional(),
  is_new_trip: z.boolean().default(true),
  trip_status: z.enum(['Loaded', 'Empty']),
});


// ==================== CREATE ENTRY ====================
export const createDieselEntry = async (req, res) => {
  try {
    const validated = createDieselEntrySchema.parse(req.body);

    // Business Rule: Extra Diesel Validation
    if (validated.extra_diesel_qty > 0) {
      if (!validated.extra_diesel_remark_id || !validated.approved_by_id) {
        return res.status(400).json({
          success: false,
          error: 'If extra diesel is added, a Reason (Remark) and Approver are required.',
        });
      }
    }

    const entry = await prisma.dieselEntry.create({
      data: {
        ...validated,
        created_by: req.user?.email || 'operator',

        // Convert Date String to Date Object
        entry_date: validated.entry_date
          ? new Date(validated.entry_date)
          : new Date(),

        // FIX: Handle invoice_time safely
        invoice_time: validated.invoice_time
          ? new Date(`1970-01-01T${validated.invoice_time}`)
          : null,

        // --- FIX STARTS HERE ---

        // Handle Optional Decimals (km, loading_weight)
        // These can be null/undefined
        km: validated.km !== undefined ? new Prisma.Decimal(validated.km) : undefined,
        loading_weight: validated.loading_weight
          ? new Prisma.Decimal(validated.loading_weight)
          : undefined,

        // Handle Required Decimals (diesel_qty, amounts)
        diesel_qty: new Prisma.Decimal(validated.diesel_qty),
        trip_advance_amount: new Prisma.Decimal(validated.trip_advance_amount),
        fooding_amount: new Prisma.Decimal(validated.fooding_amount),
        loading_unloading_amount: new Prisma.Decimal(validated.loading_unloading_amount),
        kata_charges: new Prisma.Decimal(validated.kata_charges),       // NEW
        border_charges: new Prisma.Decimal(validated.border_charges),   // NEW
        misc_charges: new Prisma.Decimal(validated.misc_charges),
        // Handle Decimals with Defaults (extra, cut)
        // FIX: Since schema has @default(0), we must pass 0, not Prisma.DbNull
        extra_diesel_qty: validated.extra_diesel_qty > 0
          ? new Prisma.Decimal(validated.extra_diesel_qty)
          : new Prisma.Decimal(0), // <--- CHANGED FROM Prisma.DbNull

        cut_diesel_qty: validated.cut_diesel_qty > 0
          ? new Prisma.Decimal(validated.cut_diesel_qty)
          : new Prisma.Decimal(0), // <--- CHANGED FROM Prisma.DbNull

        // --- FIX ENDS HERE ---
      },
      include: {
        vehicle: true,
        driver: true,
        route: true,
        customer: true,
        fromCity: true,
        toCity: true,
        pump: true,
        extraRemark: true,
        approver: true,
      },
    });

    res.status(201).json({
      success: true,
      data: toJSON(entry),
      message: 'Diesel entry saved successfully',
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

// ==================== GET ALL ENTRIES ====================
export const getAllEntries = async (req, res) => {
  try {
    const entries = await prisma.dieselEntry.findMany({
      orderBy: [
        { entry_date: 'desc' },
        { created_at: 'desc' },
      ],
      include: {
        vehicle: { select: { vehicle_number: true, vehicle_short_code: true } },
        driver: { select: { driver_name: true, driver_code: true } },
        route: { select: { route_code: true } },
        customer: { select: { customer_name: true } },
        fromCity: { select: { city_name: true } },
        toCity: { select: { city_name: true } },
        pump: { select: { pump_name: true } },
        extraRemark: { select: { remark_text: true } },
        approver: { select: { approver_name: true } },
      },
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: toJSON(entries),
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries',
    });
  }
};

// ==================== GET ALL ENTRIES WITH PAGINATION ====================
// export const getAllEntries = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 100;

//     const skip = (page - 1) * limit;

//     const [entries, totalCount] = await Promise.all([
//       prisma.dieselEntry.findMany({
//         skip,
//         take: limit,
//         orderBy: [
//           { entry_date: 'desc' },
//           { created_at: 'desc' },
//         ],
//         include: {
//           vehicle: { select: { vehicle_number: true, vehicle_short_code: true } },
//           driver: { select: { driver_name: true, driver_code: true } },
//           route: { select: { route_code: true } },
//           customer: { select: { customer_name: true } },
//           fromCity: { select: { city_name: true } },
//           toCity: { select: { city_name: true } },
//           pump: { select: { pump_name: true } },
//           extraRemark: { select: { remark_text: true } },
//           approver: { select: { approver_name: true } },
//         },
//       }),

//       prisma.dieselEntry.count()
//     ]);

//     res.status(200).json({
//       success: true,
//       data: entries,
//       pagination: {
//         total: totalCount,
//         page,
//         limit,
//         totalPages: Math.ceil(totalCount / limit),
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching entries:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch entries',
//     });
//   }
// };


const updateDieselEntrySchema = z.object({
  // --- Direct Fields (Strings) ---
  transaction_id: z.string().optional(),
  entry_date: z.string().optional(),
  invoice_number: z.string().optional(),
  invoice_time: z.string().nullable().optional(),
  material_type: z.string().optional(),
  remarks: z.string().optional(),
  created_by: z.string().optional(),

  // --- Direct Fields (Numbers) ---
  loading_weight: z.number().nonnegative().optional(),
  km: z.number().nonnegative().optional(),
  diesel_qty: z.number().positive().optional(), // Positive for diesel quantity
  trip_advance_amount: z.number().nonnegative().optional(),
  fooding_amount: z.number().nonnegative().optional(),
  loading_unloading_amount: z.number().nonnegative().optional(),
  kata_charges: z.number().nonnegative().optional(),
  border_charges: z.number().nonnegative().optional(),
  misc_charges: z.number().nonnegative().optional(),
  extra_diesel_qty: z.number().nonnegative().optional(),
  cut_diesel_qty: z.number().nonnegative().optional(),

  // --- Direct IDs (Optional - if FE sends IDs directly) ---
  vehicle_id: z.number().int().positive().optional(),
  driver_id: z.number().int().positive().optional(),
  customer_id: z.number().int().positive().optional(),
  route_id: z.number().int().positive().optional(),
  from_city_id: z.number().int().positive().optional(),
  to_city_id: z.number().int().positive().optional(),
  pump_id: z.number().int().positive().optional(),
  extra_diesel_remark_id: z.number().int().positive().optional(),
  approved_by_id: z.number().int().positive().optional(),

  // --- String Relations (For Excel-style Name -> ID lookup) ---
  vehicle_number: z.string().optional(),
  driver_name: z.string().optional(),
  customer_name: z.string().optional(),
  route_code: z.string().optional(),
  from_city_name: z.string().optional(),
  to_city_name: z.string().optional(),
  pump_name: z.string().optional(),
  extra_remark_text: z.string().optional(),
  approver_name: z.string().optional(),

  // --- Enums & Booleans ---
  trip_status: z.enum(['Loaded', 'Empty']).optional(),
  is_new_trip: z.boolean().optional(),
});

// ==================== EDIT ENTRY ====================
export const editEntries = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Validate Input
    const validated = updateDieselEntrySchema.parse(req.body);

    // 2. Resolve Relations (Names -> IDs)
    const relationUpdates = {};

    // VEHICLE
    if (validated.vehicle_number) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { vehicle_number: validated.vehicle_number },
      });
      if (vehicle) relationUpdates.vehicle_id = vehicle.id;
    }

    // DRIVER
    if (validated.driver_name) {
      const driver = await prisma.driver.findFirst({
        where: { driver_name: validated.driver_name },
      });
      if (driver) relationUpdates.driver_id = driver.id;
    }

    // CITIES
    if (validated.from_city_name) {
      const city = await prisma.city.findFirst({
        where: { city_name: validated.from_city_name },
      });
      if (city) relationUpdates.from_city_id = city.id;
    }
    if (validated.to_city_name) {
      const city = await prisma.city.findFirst({
        where: { city_name: validated.to_city_name },
      });
      if (city) relationUpdates.to_city_id = city.id;
    }

    // PUMP
    if (validated.pump_name) {
      const pump = await prisma.pump.findFirst({
        where: { pump_name: validated.pump_name },
      });
      if (pump) relationUpdates.pump_id = pump.id;
    }

    // CUSTOMER
    if (validated.customer_name) {
      const customer = await prisma.customer.findFirst({
        where: { customer_name: validated.customer_name },
      });
      if (customer) relationUpdates.customer_id = customer.id;
    }

    // ROUTE
    if (validated.route_code) {
      const route = await prisma.route.findFirst({
        where: { route_code: validated.route_code },
      });
      if (route) relationUpdates.route_id = route.id;
    }

    // EXTRA REMARK
    if (validated.extra_remark_text) {
      const remark = await prisma.extraDieselRemark.findFirst({
        where: { remark_text: validated.extra_remark_text },
      });
      if (remark) relationUpdates.extra_diesel_remark_id = remark.id;
    }

    // APPROVER
    if (validated.approver_name) {
      const approver = await prisma.extraDieselApprover.findFirst({
        where: { approver_name: validated.approver_name },
      });
      if (approver) relationUpdates.approved_by_id = approver.id;
    }

    // 3. Construct Final Data Object
    // FIX START: Do not spread 'validated' directly. Construct manually.
    const updateData = {
      // Start with IDs found
      ...relationUpdates,

      // Add String fields needed for validation/logic
      transaction_id: validated.transaction_id,
      invoice_number: validated.invoice_number,
      material_type: validated.material_type,
      remarks: validated.remarks,
      created_by: validated.created_by,
      trip_status: validated.trip_status,
      is_new_trip: validated.is_new_trip,

      // Dates - Apply Logic BEFORE putting in object
      entry_date: validated.entry_date
        ? new Date(validated.entry_date)
        : undefined,

      invoice_time: (validated.invoice_time && validated.invoice_time.trim() !== "")
        ? new Date(`1970-01-01T${validated.invoice_time}`)
        : null,
    };
    // FIX END

    // 4. Handle Decimals (Loop through and add only if defined)
    const decimalFields = [
      'km', 'loading_weight', 'diesel_qty',
      'trip_advance_amount', 'fooding_amount', 'loading_unloading_amount',
      'kata_charges', 'border_charges', 'misc_charges',
      'extra_diesel_qty', 'cut_diesel_qty'
    ];

    decimalFields.forEach(field => {
      // Use validated value, check against undefined AND null
      const val = validated[field];
      if (val !== undefined && val !== null) {
        updateData[field] = new Prisma.Decimal(val);
      }
    });

    // 5. Perform Update
    const updatedEntry = await prisma.dieselEntry.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        vehicle: { select: { vehicle_number: true, vehicle_short_code: true } },
        driver: { select: { driver_name: true, driver_code: true } },
        route: { select: { route_code: true } },
        customer: { select: { customer_name: true } },
        fromCity: { select: { city_name: true } },
        toCity: { select: { city_name: true } },
        pump: { select: { pump_name: true } },
        extraRemark: { select: { remark_text: true } },
        approver: { select: { approver_name: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: toJSON(updatedEntry),
      message: 'Entry updated successfully',
    });

  } catch (error) {
    console.error('Error updating entry:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};
// ==================== GET LAST TRIP ====================
export const getLastTrip = async (req, res) => {
  const { vehicle_id, customer_id } = req.query;

  if (!vehicle_id || !customer_id) {
    return res.status(400).json({
      success: false,
      error: 'vehicle_id and customer_id are required',
    });
  }

  try {
    const lastTrip = await prisma.dieselEntry.findFirst({
      where: {
        vehicle_id: parseInt(vehicle_id),
        customer_id: parseInt(customer_id),
      },
      orderBy: {
        entry_date: 'desc',
      },
      include: {
        vehicle: { select: { vehicle_number: true } },
        driver: { select: { driver_name: true } },
        route: { select: { route_code: true } },
        fromCity: { select: { city_name: true } },
        toCity: { select: { city_name: true } },
      },
    });

    if (!lastTrip) {
      return res.status(404).json({
        success: false,
        message: 'No past trip found for this Customer + Vehicle combination.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...toJSON(lastTrip),
        invoice_time: formatTime(lastTrip.invoice_time), // ✅ FIX
      },
    });
  } catch (error) {
    console.error('getLastTrip Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trip data',
    });
  }
};

// ==================== GET LAST TRIP (Vehicle Only) ====================
// Used for "Past Trip" auto-fill where we don't know the customer yet
export const getLastTripVehicle = async (req, res) => {
  const { vehicle_id } = req.query;

  if (!vehicle_id) {
    return res.status(400).json({
      success: false,
      error: 'vehicle_id is required',
    });
  }

  try {
    const lastTrip = await prisma.dieselEntry.findFirst({
      where: {
        vehicle_id: parseInt(vehicle_id),
      },
      orderBy: {
        entry_date: 'desc',
      },
      include: {
        // Include only relations needed for autofill
        customer: { select: { customer_name: true } },
        route: { select: { route_code: true } },
        fromCity: { select: { city_name: true } },
        toCity: { select: { city_name: true } },
        driver: { select: { id: true, driver_name: true } },
      },
    });

    if (!lastTrip) {
      return res.status(404).json({
        success: false,
        message: 'No past trip found for this vehicle.',
      });
    }

    res.status(200).json({
      success: true,
      data: toJSON(lastTrip),
    });
  } catch (error) {
    console.error('getLastTripVehicle Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trip data',
    });
  }
};

// ==================== GET DRIVER PENDING DIESEL ====================
// Calculates sum of (Extra - Cut) for remarks that imply "Cut from Trip" or "Cut from Salary"
export const getDriverPending = async (req, res) => {
  const { driver_id } = req.query;

  if (!driver_id) {
    return res.status(400).json({
      success: false,
      error: 'driver_id is required',
    });
  }

  // IDs for the specific remarks that generate pending diesel
  // IMPORTANT: Ensure these IDs match your 'extra_diesel_remarks' table
  const CUT_REMARK_IDS = [6, 7]; // 6: Cut from Trip, 7: Cut from Salary

  try {
    const result = await prisma.dieselEntry.aggregate({
      where: {
        driver_id: parseInt(driver_id),
        extra_diesel_remark_id: {
          in: CUT_REMARK_IDS
        }
      },
      _sum: {
        extra_diesel_qty: true,
        cut_diesel_qty: true,
      },
    });

    const totalExtra = result._sum.extra_diesel_qty || 0;
    const totalCut = result._sum.cut_diesel_qty || 0;
    const totalPending = totalExtra - totalCut;

    res.status(200).json({
      success: true,
      data: {
        total_extra: totalExtra,
        total_cut: totalCut,
        total_pending: totalPending > 0 ? totalPending : 0,
      },
    });
  } catch (error) {
    console.error('getDriverPending Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching pending data',
    });
  }
};
