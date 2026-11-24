// import { z } from "zod";

// export const CategorySchema = z.object({
//   id: z.union([z.string(), z.number()]).optional(),
//   name: z.string(),
//   slug: z.string().optional(),
//   description: z.string().optional(),
// });

// export const ProductSchema = z.object({
//   id: z.union([z.string(), z.number()]),
//   title: z.string(), // Sesuai dengan format FakeStoreAPI / DummyJSON
//   price: z.number(),
//   description: z.string(),
//   category: z.string(),
//   image: z.string().url().optional(),
//   rating: z
//     .object({
//       rate: z.number(),
//       count: z.number(),
//     })
//     .optional(),
// });

// export const CartItemSchema = z.object({
//   product: ProductSchema,
//   quantity: z.number().min(1),
// });



// export type Category = z.infer<typeof CategorySchema>;
// export type Product = z.infer<typeof ProductSchema>;
// export type CartItem = z.infer<typeof CartItemSchema>;


import { z } from "zod";

// ==========================================
// Enums (Selaras dengan ERD Go Fiber)
// ==========================================

export const PaymentStatusSchema = z.enum([
  "PENDING",
  "SETTLEMENT",
  "EXPIRED",
  "CANCEL",
  "DENY",
]);

export const FulfillmentTypeSchema = z.enum(["SHIPPING", "PICKUP_STORE"]);

export const FulfillmentStatusSchema = z.enum([
  "WAITING_PAYMENT",
  "PROCESSING",
  "READY_TO_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "PICKED_UP",
  "CANCELLED",
]);

// ==========================================
// Category, Product & Variant
// ==========================================

export const CategorySchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string().optional(),
  size: z.string().optional().nullable(),
  stock: z.number().int().nonnegative(),
  color: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  title: z.string(),
  price: z.number().int(),
  originalPrice: z.number().int().nullable().optional(),
  description: z.string(),
  image: z.string().nullable().optional(),
  ratingRate: z.number().default(0),
  ratingCount: z.number().int().default(0),
  category: CategorySchema.nullable().optional(),
  variants: z.array(ProductVariantSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const PaginatedProductsSchema = z.object({
  data: z.array(ProductSchema),
  totalData: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});

// ==========================================
// Cart & Checkout
// ==========================================

export const CartItemSchema = z.object({
  product: ProductSchema,
  variant: ProductVariantSchema, // Wajib pilih varian karena harga & stok ada di level varian
  quantity: z.number().int().min(1),
});

export const CreateOrderPayloadSchema = z.object({
  customerName: z.string().min(1, "Nama wajib diisi"),
  customerEmail: z.string().email("Format email tidak valid"),
  customerPhone: z.string().min(8, "Nomor HP tidak valid"),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  courier: z.string().optional(),
  shippingCost: z.number().nonnegative().default(0),
  fulfillmentType: FulfillmentTypeSchema,
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Keranjang tidak boleh kosong"),
});
export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  variantId: z.string(),
  quantity: z.number().int(),
  price: z.number(),
  variant: ProductVariantSchema.optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  userId: z.string().nullable().optional(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  shippingAddress: z.string().nullable().optional(),
  shippingCost: z.number(),
  totalAmount: z.number(),
  paymentStatus: PaymentStatusSchema,
  fulfillmentType: FulfillmentTypeSchema,
  fulfillmentStatus: FulfillmentStatusSchema,
  trackingNumber: z.string().nullable().optional(),
  snapToken: z.string().optional(),
  snapRedirectUrl: z.string().optional(),
  stockReduced: z.boolean().optional(),
  items: z.array(OrderItemSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ==========================================
// Inferred TypeScript Types
// ==========================================

export const LoginPayloadSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const CreateProductVariantPayloadSchema = z.object({
  size: z.string().min(1, "Ukuran (size) wajib diisi"),
  color: z.string().optional().nullable(),
  stock: z.number().int().nonnegative("Stok tidak boleh negatif"),
  isActive: z.boolean().default(true),
});

export const CreateProductPayloadSchema = z.object({
  categoryId: z.string().uuid("Pilih kategori produk yang valid"),
  title: z.string().min(1, "Judul produk wajib diisi"),
  price: z.number().int().positive("Harga harus lebih dari 0"),
  originalPrice: z.number().int().positive().nullable().optional(),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  image: z.string().nullable().optional(),
  variants: z.array(CreateProductVariantPayloadSchema).optional(),
});

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type FulfillmentType = z.infer<typeof FulfillmentTypeSchema>;
export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type Product = z.infer<typeof ProductSchema>;

export type CartItem = z.infer<typeof CartItemSchema>;
export type CreateOrderPayload = z.infer<typeof CreateOrderPayloadSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type CreateProductPayload = z.infer<typeof CreateProductPayloadSchema>;
export type CreateProductVariantPayload = z.infer<
  typeof CreateProductVariantPayloadSchema
>;
export type PaginatedProducts = z.infer<typeof PaginatedProductsSchema>;