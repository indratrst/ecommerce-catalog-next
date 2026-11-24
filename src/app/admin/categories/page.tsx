"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { Plus, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, categoryApi } from "@/lib/api";
import { Category } from "@/types";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    categoryApi.getAll()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch categories:", error);
        if (active) {
          setErrorMessage(error instanceof ApiError ? error.message : "Gagal memuat kategori dari server.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await categoryApi.delete(deleteId);
      setCategories((current) => current.filter((category) => String(category.id) !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setErrorMessage(error instanceof ApiError ? error.message : "Gagal menghapus kategori.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Category Name",
      render: (name: string, item: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
              /{item.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (desc: string) => (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">{desc || "No description"}</p>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Categories
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Organize your products into logical groups.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        onEdit={(item) => router.push(`/admin/categories/${item.id}/edit`)}
        onDelete={(item) => setDeleteId(String(item.id))}
        searchPlaceholder="Filter categories by name..."
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
        title="Delete Category"
        description="Are you sure you want to delete this category? Products associated with this category might need to be reassigned."
      />
    </div>
  );
}
