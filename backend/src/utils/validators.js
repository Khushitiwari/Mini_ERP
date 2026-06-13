import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      const error = new Error(message);
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

const userRoleEnum = z.enum([
  'ADMIN',
  'SALES',
  'PURCHASE',
  'MANUFACTURING',
  'INVENTORY_MANAGER',
  'OWNER',
]);

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: userRoleEnum,
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: userRoleEnum,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    type: z.enum(['RAW_MATERIAL', 'FINISHED_GOOD']),
    salesPrice: z.number().optional(),
    costPrice: z.number().optional(),
    onHandQty: z.number().int().optional(),
    procurementStrategy: z.enum(['MTS', 'MTO']).optional(),
    procureOnDemand: z.boolean().optional(),
    procurementType: z.enum(['PURCHASE', 'MANUFACTURING']).nullable().optional(),
    defaultVendorId: z.number().int().nullable().optional(),
  }),
});

export const customerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

export const vendorSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

export const bomSchema = z.object({
  body: z.object({
    finishedProductId: z.number().int(),
    components: z
      .array(
        z.object({
          componentProductId: z.number().int(),
          quantityRequired: z.number().positive(),
        })
      )
      .min(1),
    operations: z
      .array(
        z.object({
          operationName: z.string().min(1),
          durationMinutes: z.number().int().positive(),
          workCenter: z.string().min(1),
        })
      )
      .optional(),
  }),
});

export const salesOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int(),
    items: z
      .array(
        z.object({
          productId: z.number().int(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1),
  }),
});

export const purchaseOrderSchema = z.object({
  body: z.object({
    vendorId: z.number().int(),
    items: z
      .array(
        z.object({
          productId: z.number().int(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1),
  }),
});

export const manufacturingOrderSchema = z.object({
  body: z.object({
    productId: z.number().int(),
    quantity: z.number().int().positive(),
    assignedTo: z.number().int().nullable().optional(),
  }),
});
