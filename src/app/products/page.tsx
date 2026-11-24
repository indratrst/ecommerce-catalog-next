import { Suspense } from "react";
import { categoryApi } from "@/lib/api";
import { ProductListClient } from "@/components/products/ProductListClient";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category: categorySlug, search } = await searchParams;
  const categories = categorySlug ? await categoryApi.getAll() : [];
  const category = categories.find((item) => item.slug === categorySlug);
  const categoryName = category?.name ?? "All Products";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex flex-col items-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center"
          style={{ color: "var(--foreground)" }}
        >
          {search ? `Search: ${search}` : categoryName}
        </h1>
        <div
          className="h-1 w-24 mt-6"
          style={{ background: "var(--foreground)" }}
        ></div>
        {search && (
          <p className="mt-4 text-muted-foreground font-medium uppercase tracking-widest text-sm">
            Showing results for &quot;{search}&quot;
          </p>
        )}
      </div>

      <Suspense fallback={<div className="py-20 text-center">Loading products...</div>}>
        <ProductListClient initialCategory={categorySlug} initialSearch={search} />
      </Suspense>
    </div>
  );
}
