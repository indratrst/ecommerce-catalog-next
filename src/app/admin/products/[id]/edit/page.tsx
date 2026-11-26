"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useCategories } from "@/hooks/useCategories";
import { productApi } from "@/lib/api";
import type { AdminProductFormValues } from "@/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = params.id;
  const { data: categories = [], error: categoriesError } = useCategories();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productApi.getById(productId),
  });
  const updateProduct = useMutation({
    mutationFn: (payload: AdminProductFormValues) => productApi.update(productId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      router.push("/admin/products");
    },
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (error || categoriesError) return <p role="alert" className="p-8 text-red-600">{(error ?? categoriesError)?.message}</p>;
  if (!product) return <p className="p-8">Product not found.</p>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProductForm
        initialData={product}
        categories={categories}
        onSubmit={(data) => updateProduct.mutateAsync(data)}
        isLoading={updateProduct.isPending}
      />
    </div>
  );
}
