"use client";

import { useEffect, useState, use } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError, productApi } from "@/lib/api";
import { Product, ProductFormValues } from "@/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setProduct(await productApi.getById(id));
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setErrorMessage(error instanceof ApiError ? error.message : "Gagal memuat produk.");
      } finally {
        setIsFetching(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const variants = data.variants
        .filter((variant) => variant.size.trim())
        .map((variant) => ({
          id: variant.id,
          size: variant.size.trim(),
          stock: Number(variant.stock),
          color: variant.color?.trim() || null,
          isActive: true,
        }));
      await productApi.update(id, {
        categoryId: String(data.categoryId),
        title: data.title,
        price: Number(data.price),
        description: data.description,
        image: data.image || null,
        variants: [],
      });

      const currentVariants = await productApi.getVariants(id);
      const retainedIds = new Set(variants.flatMap((variant) => variant.id ? [variant.id] : []));
      await Promise.all([
        ...variants.map((variant) =>
          variant.id
            ? productApi.updateVariant(variant.id, variant)
            : productApi.createVariant(id, variant)
        ),
        ...currentVariants
          .filter((variant) => !retainedIds.has(variant.id))
          .map((variant) => productApi.deleteVariant(variant.id)),
      ]);

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      setErrorMessage(error instanceof ApiError ? error.message : "Gagal memperbarui produk.");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!product) return <div role="alert">{errorMessage || "Product not found"}</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
