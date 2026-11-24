"use client";

import { useState } from "react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useRouter } from "next/navigation";
import { ApiError, categoryApi } from "@/lib/api";
import { CategoryFormValues } from "@/types";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (data: CategoryFormValues) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await categoryApi.create(data);

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Error creating category:", error);
      setErrorMessage(error instanceof ApiError ? error.message : "Gagal menyimpan kategori ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <CategoryForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
