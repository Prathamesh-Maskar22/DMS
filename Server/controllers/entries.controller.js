// // src/controllers/entries.controller.js
// import { PrismaClient } from '@prisma/client';
// import { z } from 'zod';

// const prisma = new PrismaClient();

// // Zod validation schema (matches your PRD + DB constraints)
// const createDieselEntrySchema = z.object({
//   entry_date: z.string().optional().default(new Date().toISOString().split('T')[0]),
//   vehicle_id: z.number().int().positive(),
//   driver_id: z.number().int().positive(),
//   route_id: z.number().int().positive().optional(),
//   invoice_number: z.string().min(1),
//   invoice_time: z.string().optional(),
//   material_type: z.string().optional(),
//   customer_id: z.number().int().positive().optional(),
//   from_city_id: z.number().int().positive().optional(),
//   to_city_id: z.number().int().positive().optional(),
//   km: z.number().positive().optional(),
//   diesel_qty: z.number().positive(),
//   pump_id: z.number().int().positive().optional(),
//   trip_advance_amount: z.number().nonnegative().default(0),
//   fooding_amount: z.number().nonnegative().default(0),
//   loading_unloading_amount: z.number().nonnegative().default(0),
//   loading_weight: z.number().nonnegative().optional(),
//   extra_diesel_qty: z.number().nonnegative().default(0),
//   extra_diesel_remark_id: z.number().int().positive().optional(),
//   approved_by_id: z.number().int().positive().optional(),
//   cut_diesel_qty: z.number().nonnegative().default(0),
//   remarks: z.string().optional(),
//   is_new_trip: z.boolean().default(true),
//   trip_status: z.enum(['Loaded', 'Empty']),
//   // created_by will come from JWT middleware
// });

// export const createDieselEntry = async (req, res) => {
//   try {
//     const validated = createDieselEntrySchema.parse(req.body);

//     // Extra diesel business rule (also enforced by DB CHECK constraint)
//     if (validated.extra_diesel_qty > 0) {
//       if (!validated.extra_diesel_remark_id || !validated.approved_by_id) {
//         return res.status(400).json({
//           success: false,
//           error: 'When extra_diesel_qty > 0, both extra_diesel_remark_id and approved_by_id are required',
//         });
//       }
//     }

//     const entry = await prisma.dieselEntry.create({
//       data: {
//         ...validated,
//         created_by: req.user?.email || 'operator', // from JWT middleware
//         entry_date: new Date(validated.entry_date),
//         invoice_time: validated.invoice_time ? new Date(`1970-01-01T${validated.invoice_time}`) : undefined,
//         loading_weight: validated.loading_weight 
//           ? new Prisma.Decimal(validated.loading_weight) 
//           : undefined,
//       },
//       include: {
//         vehicle: true,
//         driver: true,
//         pump: true,
//         customer: true,
//         fromCity: true,
//         toCity: true,
//         extraRemark: true,
//         approver: true,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       data: entry,
//       message: 'Diesel entry created successfully',
//     });
//   } catch (error) {
//     console.error(error);
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({
//         success: false,
//         error: 'Validation failed',
//         details: error.errors,
//       });
//     }
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create diesel entry',
//     });
//   }
// };


// src/controllers/entries.controller.js

import { PrismaClient, Prisma } from '@prisma/client';   // ← Import Prisma here
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema (your current one is already good)
const createDieselEntrySchema = z.object({
  entry_date: z.string().optional().default(new Date().toISOString().split('T')[0]),
  vehicle_id: z.number().int().positive(),
  driver_id: z.number().int().positive(),
  route_id: z.number().int().positive().optional(),
  invoice_number: z.string().optional(),
  invoice_time: z.string().optional(),
  material_type: z.string().optional(),
  customer_id: z.number().int().positive().optional(),
  from_city_id: z.number().int().positive().optional(),
  to_city_id: z.number().int().positive().optional(),
  km: z.number().positive().optional(),
  diesel_qty: z.number().positive(),
  pump_id: z.number().int().positive().optional(),
  trip_advance_amount: z.number().nonnegative().default(0),
  fooding_amount: z.number().nonnegative().default(0),
  loading_unloading_amount: z.number().nonnegative().default(0),
  loading_weight: z.number().nonnegative().optional(),
  extra_diesel_qty: z.number().nonnegative().default(0),
  extra_diesel_remark_id: z.number().int().positive().optional(),
  approved_by_id: z.number().int().positive().optional(),
  cut_diesel_qty: z.number().nonnegative().default(0),
  remarks: z.string().optional(),
  is_new_trip: z.boolean().default(true),
  trip_status: z.enum(['Loaded', 'Empty']),
});

export const createDieselEntry = async (req, res) => {
  try {
    const validated = createDieselEntrySchema.parse(req.body);

    // Extra diesel business rule
    if (validated.extra_diesel_qty > 0) {
      if (!validated.extra_diesel_remark_id || !validated.approved_by_id) {
        return res.status(400).json({
          success: false,
          error: 'When extra_diesel_qty > 0, both extra_diesel_remark_id and approved_by_id are required',
        });
      }
    }

    const entry = await prisma.dieselEntry.create({
      data: {
        ...validated,
        created_by: req.user?.email || 'operator',
        entry_date: new Date(validated.entry_date),
        invoice_time: validated.invoice_time 
          ? new Date(`1970-01-01T${validated.invoice_time}`) 
          : undefined,

        // ✅ Correct way to handle Decimal field
        loading_weight: validated.loading_weight 
          ? new Prisma.Decimal(validated.loading_weight) 
          : undefined,
      },
      include: {
        vehicle: true,
        driver: true,
        pump: true,
        customer: true,
        fromCity: true,
        toCity: true,
        extraRemark: true,
        approver: true,
      },
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: 'Diesel entry created successfully',
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
      error: 'Failed to create diesel entry',
    });
  }
};

export const getAllEntries = async (req, res) => {
  try {
    const entries = await prisma.dieselEntry.findMany({
      orderBy: [
        { entry_date: 'desc' },
        { created_at: 'desc' },
      ],
      include: {
        vehicle: {
          select: { vehicle_number: true, vehicle_short_code: true },
        },
        driver: {
          select: { driver_name: true, driver_code: true },
        },
        route: {
          select: { route_code: true },
        },
        fromCity: {
          select: { city_name: true },
        },
        toCity: {
          select: { city_name: true },
        },
        pump: {
          select: { pump_name: true },
        },
        extraRemark: {
          select: { remark_text: true },
        },
        approver: {
          select: { approver_name: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries',
    });
  }
};