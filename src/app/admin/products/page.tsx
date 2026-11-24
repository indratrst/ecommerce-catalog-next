"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { Plus, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ApiError, productApi } from "@/lib/api";
import { Product } from "@/types";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const firstPage = await productApi.getAll({ page: 1, limit: 100 });
        const remainingPages = await Promise.all(
          Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
            productApi.getAll({ page: index + 2, limit: 100 })
          )
        );
        if (active) {
          setProducts([
            ...firstPage.data,
            ...remainingPages.flatMap((page) => page.data),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (active) {
          setErrorMessage(error instanceof ApiError ? error.message : "Gagal memuat produk dari server.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void Promise.resolve().then(loadProducts);
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await productApi.delete(deleteId);
      setProducts((current) => current.filter((product) => product.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      setErrorMessage(error instanceof ApiError ? error.message : "Gagal menghapus produk.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "image",
      label: "Product",
      render: (image: string | null | undefined, item: Product) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
            {image ? (
              <Image src={image} alt={item.title} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.category?.name ?? "Uncategorized"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (price: number) => (
        <span className="font-bold text-slate-900 dark:text-white">IDR {price.toLocaleString()}</span>
      ),
    },
    {
      key: "variants",
      label: "Stock",
      render: (variants: Product["variants"]) => {
        const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);
        return (
          <div className="flex flex-col gap-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block w-fit ${
              totalStock > 20 ? "bg-emerald-100 text-emerald-700" : 
              totalStock > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            }`}>
              {totalStock} in stock
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
              {variants.length} SKU{variants.length > 1 ? "s" : ""}
            </span>
          </div>
        );
      },
    },
    {
        key: "id",
        label: "Preview",
        render: (id: string) => (
          <Link 
            href={`/product/${id}`} 
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-widest px-3 py-1.5 bg-indigo-50 rounded-lg transition-colors group"
          >
            Storefront
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Product Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Control your inventory and showcase your items.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        onEdit={(item) => router.push(`/admin/products/${item.id}/edit`)}
        onDelete={(item) => setDeleteId(item.id)}
        searchPlaceholder="Filter products by title, category..."
      />

      {errorMessage && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will also remove all its variants."
      />
    </div>
  );
}
