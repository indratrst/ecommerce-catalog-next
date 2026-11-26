import { z } from "zod";
import {
  CreateOrderPayload,
  CreateOrderPayloadSchema,
  Order,
  OrderSchema,
  Product,
  ProductSchema,
  ProductVariant,
  ProductVariantSchema,
  Category,
  CategorySchema,
  AdminUser,
  AdminUserSchema,
  AdminProductFormValues,
  CreateProductPayloadSchema,
  LoginPayload,
  LoginPayloadSchema,
  PaginatedProducts,
  PaginatedProductsSchema,
} from "@/types";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface FetchOptions<T> extends RequestInit {
  token?: string;
  unwrapData?: boolean; // Set false jika response Go Fiber tanpa wrapper { data: ... }
  schema?: z.ZodType<T>; // Opsional: skema Zod untuk validasi runtime response
}

/**
 * Wrapper fetch utama ke backend Go Fiber.
 * Mendukung auth Bearer token, unwrapping { data }, dan validasi skema Zod.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions<T> = {}
): Promise<T> {
  const {
    token,
    unwrapData = true,
    schema,
    headers,
    ...restOptions
  } = options;

  const authToken =
    token ??
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const requestUrl = `${BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(requestUrl, {
    ...restOptions,
    headers: {
      ...(typeof FormData !== "undefined" && restOptions.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const rawPayload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      rawPayload?.message ||
      rawPayload?.error ||
      `${restOptions.method ?? "GET"} ${normalizedEndpoint} gagal dengan status ${response.status}`;
    throw new ApiError(errorMessage, response.status, rawPayload);
  }

  // Ambil isi properti `data` jika backend membungkus response di dalam { data: ... }
  const extractedData =
    unwrapData &&
    rawPayload &&
    typeof rawPayload === "object" &&
    "data" in rawPayload
      ? rawPayload.data
      : rawPayload;

  // Validasi response menggunakan Zod jika schema disediakan
  if (schema) {
    const parsed = schema.safeParse(extractedData);
    if (!parsed.success) {
      console.error(
        `[Zod Validation Error] Endpoint: ${normalizedEndpoint}`,
        parsed.error.flatten()
      );
      throw new ApiError(
        "Format data dari server tidak sesuai dengan skema yang diharapkan.",
        500,
        parsed.error.flatten()
      );
    }
    return parsed.data;
  }

  return extractedData as T;
}


export const authApi = {
  login: async (payload: LoginPayload) => {
    const validPayload = LoginPayloadSchema.parse(payload);
    const res = await apiFetch<{ token: string; user?: Record<string, unknown> }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(validPayload),
      }
    );

    if (typeof window !== "undefined" && res?.token) {
      localStorage.setItem("token", res.token);
      // Simpan ke cookie agar Server Component (AdminLayout) bisa membacanya
      document.cookie = `token=${res.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return res;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    }
  },
};
// ==========================================
// Service Helpers (Products & Orders)
// ==========================================



export const productApi = {
  create: (payload: AdminProductFormValues) => {
    const validPayload = CreateProductPayloadSchema.parse({
      ...payload,
      variants: payload.variants.map(({ size, stock, color, isActive }) => ({
        size,
        stock,
        color,
        isActive,
      })),
    });
    return apiFetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify({
        categoryId: validPayload.categoryId,
        title: validPayload.title,
        price: validPayload.price,
        originalPrice: validPayload.originalPrice,
        description: validPayload.description,
        image: validPayload.image,
        variants: validPayload.variants,
      }),
      schema: ProductSchema,
    });
  },
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    const qs = query.toString() ? `?${query.toString()}` : "";

    return apiFetch<PaginatedProducts>(`/products${qs}`, {
      cache: "no-store",
      schema: PaginatedProductsSchema,
    });
  },

  getById: (id: string) =>
    apiFetch<Product>(`/products/${id}`, {
      cache: "no-store",
      schema: ProductSchema,
    }),

  update: async (id: string, payload: AdminProductFormValues) => {
    const validPayload = CreateProductPayloadSchema.parse({
      ...payload,
      variants: undefined,
    });
    const updatedProduct = await apiFetch<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        categoryId: validPayload.categoryId,
        title: validPayload.title,
        price: validPayload.price,
        originalPrice: validPayload.originalPrice,
        description: validPayload.description,
        image: validPayload.image,
      }),
      schema: ProductSchema,
    });

    const existingVariants = await productApi.getVariants(id);
    const submittedIds = new Set(
      payload.variants.flatMap((variant) => variant.id ? [variant.id] : []),
    );
    const removedVariants = existingVariants.filter(
      (variant) => !submittedIds.has(variant.id),
    );
    await Promise.all([
      ...removedVariants.map((variant) => productApi.deleteVariant(variant.id)),
      ...payload.variants.map((variant) => {
        const variantPayload = {
          size: variant.size,
          stock: variant.stock,
          color: variant.color,
          isActive: variant.isActive ?? true,
        };
        return variant.id
          ? productApi.updateVariant(variant.id, variantPayload)
          : productApi.createVariant(id, variantPayload);
      }),
    ]);

    return updatedProduct;
  },

  delete: (id: string) =>
    apiFetch<null>(`/products/${id}`, { method: "DELETE" }),

  getVariants: (id: string) =>
    apiFetch<ProductVariant[]>(`/products/${id}/variants`, {
      cache: "no-store",
      schema: z.array(ProductVariantSchema),
    }),

  createVariant: (
    productId: string,
    payload: { size: string; stock: number; color?: string | null; isActive?: boolean }
  ) =>
    apiFetch<ProductVariant>(`/products/${productId}/variants`, {
      method: "POST",
      body: JSON.stringify(payload),
      schema: ProductVariantSchema,
    }),

  updateVariant: (
    id: string,
    payload: { size: string; stock: number; color?: string | null; isActive?: boolean }
  ) =>
    apiFetch<ProductVariant>(`/product-variants/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      schema: ProductVariantSchema,
    }),

  deleteVariant: (id: string) =>
    apiFetch<null>(`/product-variants/${id}`, { method: "DELETE" }),
};

export const categoryApi = {
  getAll: () =>
    apiFetch<Category[]>("/categories", {
      cache: "no-store",
      schema: z.array(CategorySchema),
    }),

  getById: (id: string) =>
    apiFetch<Category>(`/categories/${id}`, {
      cache: "no-store",
      schema: CategorySchema,
    }),

  create: (payload: Pick<Category, "name"> & Partial<Pick<Category, "slug" | "description" | "image">>) =>
    apiFetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
      schema: CategorySchema,
    }),

  update: (id: string, payload: Pick<Category, "name"> & Partial<Pick<Category, "slug" | "description" | "image">>) =>
    apiFetch<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      schema: CategorySchema,
    }),

  delete: (id: string) =>
    apiFetch<null>(`/categories/${id}`, { method: "DELETE" }),
};

export const adminUserApi = {
  getAll: (token?: string) =>
    apiFetch<AdminUser[]>("/users", {
      token,
      cache: "no-store",
      schema: z.array(AdminUserSchema),
    }),

  create: (payload: { name: string; email: string; password: string; role: AdminUser["role"]; image?: string | null }) =>
    apiFetch<AdminUser>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
      schema: AdminUserSchema,
    }),

  update: (id: string, payload: { name: string; email: string; password?: string; role: AdminUser["role"]; image?: string | null }) =>
    apiFetch<AdminUser>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      schema: AdminUserSchema,
    }),

  delete: (id: string) =>
    apiFetch<null>(`/users/${id}`, { method: "DELETE" }),
};

export const imageApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ publicUrl: string }>("/uploads", {
      method: "POST",
      body: formData,
      schema: z.object({ publicUrl: z.string().url() }),
    });
  },
};

export const orderApi = {
  create: async (payload: CreateOrderPayload) => {
    const validPayload = CreateOrderPayloadSchema.parse(payload);
    const order = await apiFetch<Order>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(validPayload),
      schema: OrderSchema,
    });
    if (!order.snapRedirectUrl) {
      throw new ApiError(
        "Backend tidak mengembalikan URL pembayaran Midtrans.",
        502,
        order,
      );
    }
    return order;
  },

  getAll: (token?: string) =>
    apiFetch<Order[]>("/orders", {
      token,
      cache: "no-store",
      schema: z.array(OrderSchema),
    }),

  getById: (id: string) =>
    apiFetch<Order>(`/orders/${id}`, {
      cache: "no-store",
      schema: OrderSchema,
    }),

  updateShipment: (
    id: string,
    payload: { trackingNumber?: string; status: string },
  ) =>
    apiFetch<Order>(`/orders/${id}/shipment`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      schema: OrderSchema,
    }),
};