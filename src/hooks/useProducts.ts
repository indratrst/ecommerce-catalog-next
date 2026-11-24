import { useQuery } from "@tanstack/react-query";
import { categoryApi, productApi } from "@/lib/api";
import { Product } from "@/types";

async function getAllProducts(search?: string, categorySlug?: string): Promise<Product[]> {
  let categoryId: string | undefined;
  if (categorySlug) {
    const categories = await categoryApi.getAll();
    categoryId = categories.find((category) => category.slug === categorySlug)?.id?.toString();
    if (!categoryId) return [];
  }

  const firstPage = await productApi.getAll({
    page: 1,
    limit: 100,
    search,
    categoryId,
  });
  if (firstPage.totalPages <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      productApi.getAll({
        page: index + 2,
        limit: firstPage.limit,
        search,
        categoryId,
      })
    )
  );
  return [...firstPage.data, ...remainingPages.flatMap((page) => page.data)];
}

export function useProducts(categorySlug?: string, search?: string) {
  return useQuery<Product[]>({
    queryKey: ["products", { category: categorySlug, search }],
    queryFn: () => getAllProducts(search, categorySlug),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
