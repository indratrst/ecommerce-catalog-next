"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { orderApi } from "@/lib/api";

export default function OrdersDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState("");
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getById(orderId),
  });
  const updateOrder = useMutation({
    mutationFn: (payload: { status: string; trackingNumber?: string }) =>
      orderApi.updateShipment(orderId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (error) return <p role="alert" className="p-8 text-red-600">{error.message}</p>;
  if (!order) return <p className="p-8">Order not found.</p>;

  const isPickup = order.shippingMethod === "PICKUP_STORE";
  const nextStatus =
    isPickup && order.fulfillmentStatus === "PROCESSING"
      ? "READY_TO_PICKUP"
      : isPickup && order.fulfillmentStatus === "READY_TO_PICKUP"
        ? "PICKED_UP"
        : !isPickup && order.fulfillmentStatus === "PROCESSING"
          ? "SHIPPED"
          : !isPickup && order.fulfillmentStatus === "SHIPPED"
            ? "DELIVERED"
            : null;
  const submitStatus = (status: string) => {
    updateOrder.mutate({
      status,
      ...(status === "SHIPPED" ? { trackingNumber: trackingNumber.trim() } : {}),
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"><ArrowLeft className="h-4 w-4" />Back to orders</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order {order.externalId ?? order.id}</h1>
        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <p><strong>Customer:</strong> {order.customerName} ({order.customerEmail})</p>
          <p><strong>Phone:</strong> {order.customerPhone}</p>
          <p><strong>Payment:</strong> {order.paymentStatus}{order.paymentMethod ? ` · ${order.paymentMethod}` : ""}</p>
          <p><strong>Fulfillment:</strong> {order.fulfillmentStatus}</p>
          <p><strong>Method:</strong> {order.shippingMethod}{order.shippingCourier ? ` · ${order.shippingCourier}` : ""}</p>
          <p><strong>Tracking:</strong> {order.trackingNumber ?? "-"}</p>
          <p className="sm:col-span-2"><strong>Address / store:</strong> {order.shippingAddress ?? "-"}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-bold">Items</h2>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>{item.productVariant?.product?.title ?? "Product"} · {item.productVariant?.size ?? "Variant"}{item.productVariant?.color ? ` / ${item.productVariant.color}` : ""} × {item.quantity}</span>
              <span className="font-semibold">IDR {(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          {!order.items?.length && <p className="py-3 text-sm text-slate-500">Order item details are not available.</p>}
        </div>
        <p className="mt-4 text-right text-lg font-bold">Total: IDR {order.totalAmount.toLocaleString()}</p>
      </section>

      {nextStatus && (
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end">
          {!isPickup && order.fulfillmentStatus === "PROCESSING" && (
            <label className="flex-1 space-y-2 text-sm font-semibold">
              Tracking number
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} required />
            </label>
          )}
          <button
            type="button"
            disabled={updateOrder.isPending || (nextStatus === "SHIPPED" && !trackingNumber.trim())}
            onClick={() => submitStatus(nextStatus)}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {updateOrder.isPending ? "Saving..." : `Set ${nextStatus.replaceAll("_", " ")}`}
          </button>
        </section>
      )}
      {updateOrder.error && <p role="alert" className="text-sm text-red-600">{updateOrder.error.message}</p>}
    </div>
  );
}
