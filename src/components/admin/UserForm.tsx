"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Shield } from "lucide-react";
import type { AdminRole, AdminUserFormValues } from "@/types";
import { ImageUpload } from "./ImageUpload";

interface UserFormProps {
  initialData?: { name: string; email: string; role: AdminRole; image?: string | null } | null;
  onSubmit: (data: AdminUserFormValues) => Promise<unknown>;
  isLoading?: boolean;
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
  const [values, setValues] = useState<AdminUserFormValues>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    password: "",
    role: initialData?.role ?? "USER",
    image: initialData?.image ?? "",
  });
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal menyimpan user.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/users" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="h-5 w-5" /></Link>
        <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">{initialData ? "Edit User" : "New User"}</h2>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="block space-y-2 text-sm font-semibold">Full name
          <input className={fieldClass} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required />
        </label>
        <label className="block space-y-2 text-sm font-semibold">Email address
          <input className={fieldClass} type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required />
        </label>
        <label className="block space-y-2 text-sm font-semibold">{initialData ? "New password (optional)" : "Password"}
          <input className={fieldClass} type="password" autoComplete="new-password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} required={!initialData} />
        </label>
        <label className="block space-y-2 text-sm font-semibold">Role
          <span className="relative block">
            <select className={fieldClass} value={values.role} onChange={(event) => setValues({ ...values, role: event.target.value as AdminRole })}>
              <option value="USER">User</option><option value="ADMIN">Admin</option><option value="SUPERUSER">Superuser</option>
            </select>
            <Shield className="pointer-events-none absolute right-4 top-3 h-4 w-4 text-slate-400" />
          </span>
        </label>
        <ImageUpload
          label="User image"
          value={values.image ?? ""}
          onChange={(image) => setValues({ ...values, image })}
        />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-50">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{initialData ? "Update User" : "Save User"}{!initialData && <Plus className="h-5 w-5" />}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
