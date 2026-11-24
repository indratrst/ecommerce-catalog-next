import { ApiError, productApi } from "@/lib/api";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;
  try {
    product = await productApi.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (!product) {
    return notFound();
  }

  const activeVariants = product.variants.filter((variant) => variant.isActive);
  const totalStock = activeVariants.reduce((sum, variant) => sum + variant.stock, 0);
  const variants = activeVariants.map((variant) => ({
    id: variant.id,
    size: variant.size ?? "One Size",
    color: variant.color ?? null,
    stock: variant.stock,
  }));

  return (
    <ProductDetailClient
      product={product}
      totalStock={totalStock}
      variants={variants}
    />
  );
}
