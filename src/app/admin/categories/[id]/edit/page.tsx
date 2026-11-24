"use client";

import { useEffect, useState, use } from "react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError, categoryApi } from "@/lib/api";
import { Category, CategoryFormValues } from "@/types";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchCategory() {
      try {
        setCategory(await categoryApi.getById(id));
      } catch (error) {
        console.error("Failed to fetch category:", error);
        setErrorMessage(error instanceof ApiError ? error.message : "Gagal memuat kategori.");
      } finally {
        setIsFetching(false);
      }
    }
    fetchCategory();
  }, [id]);

  const handleSubmit = async (data: CategoryFormValues) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await categoryApi.update(id, data);

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Error updating category:", error);
      setErrorMessage(error instanceof ApiError ? error.message : "Gagal memperbarui kategori.");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!category) return <div role="alert">{errorMessage || "Category not found"}</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <CategoryForm initialData={category} onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
