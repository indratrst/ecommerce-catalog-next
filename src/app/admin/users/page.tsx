"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Column, DataTable } from "@/components/admin/DataTable";
import { DeleteModal } from "@/components/admin/DeleteModal";
import { UserForm } from "@/components/admin/UserForm";
import { Plus, Shield, ShieldCheck, ShieldAlert, X } from "lucide-react";
import { adminUserApi } from "@/lib/api";
import type { AdminUser, AdminUserFormValues } from "@/types";
import { LucideIcon } from "lucide-react";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminUserApi.getAll(),
  });
  const createUser = useMutation({
    mutationFn: adminUserApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; email: string; role: AdminUser["role"]; password?: string; image?: string | null } }) => adminUserApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal for creating/editing users
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const deleteUser = useMutation({
    mutationFn: adminUserApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Failed to delete user.");
    }
  };

  const handleSubmit = async (data: AdminUserFormValues) => {
    setFormLoading(true);
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: {
          name: data.name,
          email: data.email,
          role: data.role,
          image: data.image || null,
            ...(data.password ? { password: data.password } : {}),
          },
        });
      } else {
        await createUser.mutateAsync({ ...data, image: data.image || null });
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (submitError) {
      throw submitError;
    } finally {
      setFormLoading(false);
    }
  };

  type RoleConfig = {
    bg: string;
    text: string;
    icon: LucideIcon;
  };

  const roleConfig: Record<AdminUser["role"], RoleConfig> = {
    SUPERUSER: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      icon: ShieldCheck,
    },
    ADMIN: { bg: "bg-blue-100", text: "text-blue-700", icon: Shield },
    USER: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      icon: ShieldAlert,
    },
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Name",
      render: (name, item) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">
            {name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {item.email}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (role) => {
        const { bg, text, icon: Icon } = roleConfig[role] || roleConfig.USER;
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${bg} ${text}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {role}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (date) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage access and permissions for your staff.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Access
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onEdit={(item) => {
          setEditingUser(item);
          setIsModalOpen(true);
        }}
        onDelete={(item) => setDeleteId(item.id)}
        searchPlaceholder="Filter users by name, email..."
      />
      {error && <p role="alert" className="text-sm text-red-600">{error.message}</p>}

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto relative animate-in zoom-in-95 duration-200 scrollbar-hide">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <UserForm
                initialData={editingUser}
                onSubmit={handleSubmit}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
        title="Revoke Access"
        description="Are you sure you want to remove this user? They will lose all access to the CMS immediately."
      />
    </div>
  );
}
