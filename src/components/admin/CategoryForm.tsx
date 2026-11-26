"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import type { AdminCategoryFormValues } from "@/types";
import { ImageUpload } from "./ImageUpload";

interface CategoryFormProps {
  initialData?: Omit<AdminCategoryFormValues, "description" | "image"> & {
    description?: string | null;
    image?: string | null;
  };
  onSubmit: (data: AdminCategoryFormValues) => void | Promise<unknown>;
  isLoading?: boolean;
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export function CategoryForm({ initialData, onSubmit, isLoading }: CategoryFormProps) {
  const [values, setValues] = useState<AdminCategoryFormValues>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    image: initialData?.image ?? "",
  });
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        slug: values.slug?.trim(),
        description: values.description?.trim(),
        image: values.image?.trim() || null,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal menyimpan kategori.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/categories" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="h-5 w-5" /></Link>
        <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">{initialData ? "Edit Category" : "New Category"}</h2>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="block space-y-2 text-sm font-semibold">
          Category name
          <input className={fieldClass} value={values.name} onChange={(event) => {
            const name = event.target.value;
            setValues({ ...values, name, ...(initialData?.slug ? {} : { slug: name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") }) });
          }} required />
        </label>
        <label className="block space-y-2 text-sm font-semibold">
          Slug
          <input className={fieldClass} value={values.slug ?? ""} onChange={(event) => setValues({ ...values, slug: event.target.value })} required />
        </label>
        <label className="block space-y-2 text-sm font-semibold">
          Description
          <textarea className={fieldClass} rows={4} value={values.description ?? ""} onChange={(event) => setValues({ ...values, description: event.target.value })} />
        </label>
        <div className="space-y-3">
          <ImageUpload
            label="Category image"
            value={values.image ?? ""}
            onChange={(image) => setValues({ ...values, image })}
          />
          <label className="block space-y-2 text-sm font-semibold">
            Or enter image URL
            <input className={fieldClass} type="url" value={values.image ?? ""} onChange={(event) => setValues({ ...values, image: event.target.value })} />
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-50">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{initialData ? "Update Category" : "Save Category"}{!initialData && <Plus className="h-5 w-5" />}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
