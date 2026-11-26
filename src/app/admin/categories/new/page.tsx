"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { categoryApi } from "@/lib/api";
import type { AdminCategoryFormValues } from "@/types";

export default function NewCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createCategory = useMutation({
    mutationFn: (payload: AdminCategoryFormValues) => categoryApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/admin/categories");
    },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CategoryForm
        onSubmit={(data) => createCategory.mutateAsync(data)}
        isLoading={createCategory.isPending}
      />
    </div>
  );
}
