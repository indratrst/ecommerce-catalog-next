import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
    staleTime: 60 * 60 * 1000,
  });
}
