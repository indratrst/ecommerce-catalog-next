import { z } from "zod";
import {
  CreateOrderPayload,
  CreateOrderPayloadSchema,
  Order,
  OrderSchema,
  Product,
  ProductSchema,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

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

  const response = await fetch(`${BASE_URL}${normalizedEndpoint}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const rawPayload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      rawPayload?.message ||
      rawPayload?.error ||
      `Request gagal dengan status ${response.status}`;
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

// ==========================================
// Service Helpers (Products & Orders)
// ==========================================

export const productApi = {
  getAll: () =>
    apiFetch<Product[]>("/products", {
      cache: "no-store",
      schema: z.array(ProductSchema),
    }),

  getByIdOrSlug: (idOrSlug: string) =>
    apiFetch<Product>(`/products/${idOrSlug}`, {
      cache: "no-store",
      schema: ProductSchema,
    }),
};

export const orderApi = {
  create: (payload: CreateOrderPayload) => {
    // Validasi payload di sisi klien sebelum dikirim ke Go Fiber
    const validPayload = CreateOrderPayloadSchema.parse(payload);

    return apiFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(validPayload),
      schema: OrderSchema,
    });
  },

  getById: (id: string) =>
    apiFetch<Order>(`/orders/${id}`, {
      cache: "no-store",
      schema: OrderSchema,
    }),
};