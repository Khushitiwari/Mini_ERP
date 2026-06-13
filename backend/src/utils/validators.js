const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
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

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'SALES', 'PURCHASE', 'MANUFACTURING', 'INVENTORY_MANAGER', 'OWNER']),
    address: z.string().optional(),
    mobile: z.string().optional(),
    photo: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const productSchema = z.object({
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

const customerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

const vendorSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

const bomSchema = z.object({
  body: z.object({
    finishedProductId: z.number().int(),
    components: z.array(
      z.object({
        componentProductId: z.number().int(),
        quantityRequired: z.number().positive(),
      })
    ).min(1),
    operations: z.array(
      z.object({
        operationName: z.string().min(1),
        durationMinutes: z.number().int().positive(),
        workCenter: z.string().min(1),
      })
    ).optional(),
  }),
});

const salesOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int(),
    items: z.array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().positive(),
      })
    ).min(1),
  }),
});

const purchaseOrderSchema = z.object({
  body: z.object({
    vendorId: z.number().int(),
    items: z.array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().positive(),
      })
    ).min(1),
  }),
});

const manufacturingOrderSchema = z.object({
  body: z.object({
    productId: z.number().int(),
    quantity: z.number().int().positive(),
    assignedTo: z.number().int().nullable().optional(),
  }),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  productSchema,
  customerSchema,
  vendorSchema,
  bomSchema,
  salesOrderSchema,
  purchaseOrderSchema,
  manufacturingOrderSchema,
};
