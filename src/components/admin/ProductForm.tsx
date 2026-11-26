"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import type { AdminProductFormValues, Category } from "@/types";
import { ImageUpload } from "./ImageUpload";

type ProductFormVariant = AdminProductFormValues["variants"][number];
type ProductFormInitialData = Omit<Partial<AdminProductFormValues>, "variants" | "image"> & {
  image?: string | null;
  variants?: Array<{
    id?: string;
    size?: string | null;
    stock: number;
    color?: string | null;
    isActive?: boolean;
  }>;
};

interface ProductFormProps {
  initialData?: ProductFormInitialData;
  categories?: Category[];
  onSubmit: (data: AdminProductFormValues) => Promise<unknown>;
  isLoading?: boolean;
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export function ProductForm({
  initialData,
  categories = [],
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const [values, setValues] = useState<AdminProductFormValues>({
    categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
    title: initialData?.title ?? "",
    price: initialData?.price ?? 0,
    originalPrice: initialData?.originalPrice ?? null,
    description: initialData?.description ?? "",
    image: initialData?.image ?? "",
    variants: initialData?.variants?.length
      ? initialData.variants.map((variant) => ({
          id: variant.id,
          size: variant.size ?? "",
          stock: variant.stock,
          color: variant.color ?? "",
          isActive: variant.isActive,
        }))
      : [{ size: "One Size", stock: 0, color: "" }],
  });
  const [error, setError] = useState("");

  const updateVariant = (
    index: number,
    changes: Partial<ProductFormVariant>,
  ) => {
    setValues((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...changes } : variant,
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setValues((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!values.categoryId || !values.title.trim() || values.price <= 0) {
      setError("Isi kategori, nama produk, dan harga yang valid.");
      return;
    }
    if (
      values.variants.some(
        (variant) => !variant.size.trim() || variant.stock < 0,
      )
    ) {
      setError("Setiap varian harus memiliki ukuran dan stok yang valid.");
      return;
    }
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        image: values.image?.trim() || null,
        variants: values.variants.map((variant) => ({
          ...variant,
          size: variant.size.trim(),
          color: variant.color?.trim() || null,
        })),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal menyimpan produk.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/products" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">
          {initialData ? "Edit Product" : "New Product"}
        </h2>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <label className="block space-y-2 text-sm font-semibold">
            Product title
            <input className={fieldClass} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required />
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-semibold">
              Price (IDR)
              <input className={fieldClass} type="number" min="1" value={values.price} onChange={(event) => setValues({ ...values, price: Number(event.target.value) })} required />
            </label>
            <label className="block space-y-2 text-sm font-semibold">
              Original price (optional)
              <input className={fieldClass} type="number" min="1" value={values.originalPrice ?? ""} onChange={(event) => setValues({ ...values, originalPrice: event.target.value ? Number(event.target.value) : null })} />
            </label>
          </div>
          <label className="block space-y-2 text-sm font-semibold">
            Category
            <select className={fieldClass} value={values.categoryId} onChange={(event) => setValues({ ...values, categoryId: event.target.value })} required>
              <option value="">Select a category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-semibold">
            Description
            <textarea className={fieldClass} rows={5} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} required />
          </label>
          <div className="space-y-3">
            <ImageUpload
              label="Product image"
              value={values.image ?? ""}
              onChange={(image) => setValues({ ...values, image })}
            />
            <label className="block space-y-2 text-sm font-semibold">
              Or enter image URL
              <input className={fieldClass} type="url" value={values.image ?? ""} onChange={(event) => setValues({ ...values, image: event.target.value })} />
            </label>
          </div>
          <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-indigo-600">Inventory &amp; Variants</h3>
              <button type="button" className="flex items-center gap-1 text-sm font-bold text-indigo-600" onClick={() => setValues({ ...values, variants: [...values.variants, { size: "", stock: 0, color: "" }] })}>
                <Plus className="h-4 w-4" /> Add variant
              </button>
            </div>
            {values.variants.map((variant, index) => (
              <div key={variant.id ?? index} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-4 dark:border-slate-700">
                <input className={fieldClass} aria-label="Size" placeholder="Size" value={variant.size} onChange={(event) => updateVariant(index, { size: event.target.value })} required />
                <input className={fieldClass} aria-label="Color" placeholder="Color" value={variant.color ?? ""} onChange={(event) => updateVariant(index, { color: event.target.value })} />
                <input className={fieldClass} aria-label="Stock" type="number" min="0" placeholder="Stock" value={variant.stock} onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })} required />
                <button type="button" aria-label="Remove variant" disabled={values.variants.length <= 1} className="flex items-center justify-center text-red-500 disabled:opacity-30" onClick={() => removeVariant(index)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </section>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <Link href="/admin/products" className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Cancel</Link>
            <button type="submit" disabled={isLoading || categories.length === 0} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-50">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialData ? "Update product" : "Publish product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
