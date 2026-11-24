"use client";

import { useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useRouter } from "next/navigation";
import { ApiError, productApi } from "@/lib/api";
import { ProductFormValues } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const variants = data.variants
        .filter((variant) => variant.size.trim())
        .map((variant) => ({
          size: variant.size.trim(),
          stock: Number(variant.stock),
          color: variant.color?.trim() || null,
          isActive: true,
        }));
      await productApi.create({
        categoryId: String(data.categoryId),
        title: data.title,
        price: Number(data.price),
        description: data.description,
        image: data.image || null,
        variants,
      });

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error creating product:", error);
      setErrorMessage(error instanceof ApiError ? error.message : "Gagal menyimpan produk ke server.");
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
      <ProductForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
