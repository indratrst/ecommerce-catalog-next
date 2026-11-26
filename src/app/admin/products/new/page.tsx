"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { useCategories } from "@/hooks/useCategories";
import { productApi } from "@/lib/api";
import type { AdminProductFormValues } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading, error } = useCategories();
  const createProduct = useMutation({
    mutationFn: (payload: AdminProductFormValues) => productApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/admin/products");
    },
  });

  if (isLoading) return <p className="p-8">Loading categories...</p>;
  if (error) return <p role="alert" className="p-8 text-red-600">{error.message}</p>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProductForm
        onSubmit={(data) => createProduct.mutateAsync(data)}
        isLoading={createProduct.isPending}
        categories={categories}
      />
    </div>
  );
}
