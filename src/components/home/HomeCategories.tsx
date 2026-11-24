"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

const categoryImageFallbacks = [
  "https://images.unsplash.com/photo-1516826957135-700ede19c6ce?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800&auto=format&fit=crop",
];

export function HomeCategories() {
  const { data: categories, isLoading, isError, error } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {categoryImageFallbacks.map((image) => (
          <div
            key={image}
            className="h-100 animate-pulse bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="py-10 text-center text-red-600">
        {error instanceof Error ? error.message : "Kategori gagal dimuat dari server."}
      </p>
    );
  }

  if (!categories?.length) {
    return <p className="py-10 text-center text-slate-500">Belum ada kategori.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {categories.map((category, index) => (
        <Link
          key={category.id ?? category.slug ?? category.name}
          href={category.slug ? `/category/${category.slug}` : "/products"}
          className="group relative h-100 overflow-hidden flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: `url('${category.image || categoryImageFallbacks[index % categoryImageFallbacks.length]}')`,
            }}
          >
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/50" />
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
              {category.name}
            </h3>
            <span className="inline-block border-b-2 border-white text-white font-medium pb-1 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              Explore
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
