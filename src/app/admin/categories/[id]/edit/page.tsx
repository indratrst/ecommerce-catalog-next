"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { categoryApi } from "@/lib/api";
import type { AdminCategoryFormValues } from "@/types";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoryId = params.id;
  const { data: category, isLoading, error } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => categoryApi.getById(categoryId),
  });
  const updateCategory = useMutation({
    mutationFn: (payload: AdminCategoryFormValues) => categoryApi.update(categoryId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      router.push("/admin/categories");
    },
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (error) return <p role="alert" className="p-8 text-red-600">{error.message}</p>;
  if (!category) return <p className="p-8">Category not found.</p>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CategoryForm
        initialData={category}
        onSubmit={(data) => updateCategory.mutateAsync(data)}
        isLoading={updateCategory.isPending}
      />
    </div>
  );
}
