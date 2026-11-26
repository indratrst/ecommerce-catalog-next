import { cookies } from "next/headers";
import {
  Package,
  Tag,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Plus,
  BanknoteArrowUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ApiError, adminUserApi, categoryApi, orderApi, productApi } from "@/lib/api";

export default async function AdminDashboard() {
  const token = (await cookies()).get("token")?.value;
  const [products, categories, orders] = await Promise.all([
    productApi.getAll({ page: 1, limit: 5 }),
    categoryApi.getAll(),
    orderApi.getAll(token),
  ]);
  let userCount: number | string = "N/A";
  try {
    userCount = (await adminUserApi.getAll(token)).length;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
  }

  const stats = [
    { name: "Total Products", value: products.totalData, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Categories", value: categories.length, icon: Tag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Admin Users", value: userCount, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Total Orders", value: orders.length, icon: BanknoteArrowUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">Welcome back to your store management system.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-2xl p-4 ${stat.bg} ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
              <ArrowUpRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-indigo-500" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.name}</p>
            <h3 className="mt-1 text-4xl font-black tabular-nums text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><ShoppingBag className="h-5 w-5 text-indigo-500" />Recent Arrivals</h3>
            <Link href="/admin/products" className="text-xs font-bold uppercase tracking-widest text-indigo-600">View All</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.data.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  {product.image && <Image src={product.image} alt={product.title} priority
            unoptimized className="object-cover" fill />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">{product.title}</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{product.category?.name ?? "Uncategorized"}</p>
                </div>
                <p className="text-sm font-bold text-indigo-600">IDR {product.price.toLocaleString()}</p>
              </div>
            ))}
            {products.data.length === 0 && <p className="p-6 text-sm text-slate-500">Belum ada produk.</p>}
          </div>
        </div>
        <div className="space-y-6">
          <div className="group relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-600/20">
            <div className="relative z-10">
              <h3 className="mb-2 text-2xl font-black uppercase tracking-tight">Grow Your Catalog</h3>
              <p className="mb-6 text-sm font-medium text-indigo-50/90">Add new high-quality products to elevate your store&apos;s appeal.</p>
              <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-indigo-600"><Plus className="h-4 w-4" />New Product</Link>
            </div>
            <Package className="absolute -bottom-10 -right-10 h-48 w-48 rotate-12 opacity-10 transition-transform group-hover:scale-110" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/categories/new" className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-500 dark:border-slate-800 dark:bg-slate-900">
              <Tag className="h-5 w-5 text-emerald-500" /><span className="text-sm font-bold text-slate-900 dark:text-white">Categories</span>
            </Link>
            <Link href="/admin/users" className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-500 dark:border-slate-800 dark:bg-slate-900">
              <Users className="h-5 w-5 text-purple-500" /><span className="text-sm font-bold text-slate-900 dark:text-white">User Roles</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
