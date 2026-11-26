"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  CircleX,
  Clock3,
  ShoppingBag,
} from "lucide-react";
import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

interface CheckoutSuccessClientProps {
  orderNumber: string;
  transactionStatus: string;
}

export default function CheckoutSuccessClient({
  orderNumber,
  transactionStatus,
}: CheckoutSuccessClientProps) {
  const paymentSuccessful =
    transactionStatus === "settlement" || transactionStatus === "capture";
  const paymentFailed = ["deny", "cancel", "expire", "failure"].includes(
    transactionStatus,
  );

  useEffect(() => {
    if (paymentSuccessful) {
      useCartStore.getState().clearCart();
    }

    if (orderNumber && typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("checkout-payment");
      channel.postMessage({ orderNumber, transactionStatus });
      channel.close();
    }
  }, [orderNumber, paymentSuccessful, transactionStatus]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div
        className={`p-4 rounded-full mb-6 ${
          paymentSuccessful
            ? "bg-green-50 text-green-600"
            : paymentFailed
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-600"
        }`}
      >
        {paymentSuccessful ? (
          <CheckCircle className="h-16 w-16" />
        ) : paymentFailed ? (
          <CircleX className="h-16 w-16" />
        ) : (
          <Clock3 className="h-16 w-16" />
        )}
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter mb-4">
        {paymentSuccessful
          ? "Payment Successful"
          : paymentFailed
            ? "Payment Not Completed"
            : "Payment Processing"}
      </h1>

      <p className="text-muted-foreground max-w-md mb-2">
        {paymentSuccessful
          ? "Thank you for your purchase! Your payment has been confirmed."
          : paymentFailed
            ? "The payment was not completed. You can return to checkout and try again."
            : "Your order was created. Payment status may take a moment to update."}
      </p>

      {orderNumber && (
        <div className="bg-surface p-4 rounded mb-10 w-full max-w-sm">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
            Order Number
          </p>
          <p className="text-xl font-mono font-bold">{orderNumber}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {!paymentSuccessful && (
          <Link
            href="/checkout"
            className="flex-1 border-2 border-black py-4 px-8 uppercase font-bold text-sm tracking-widest hover:bg-black hover:text-white transition-all"
          >
            Return to Checkout
          </Link>
        )}
        <Link
          href="/products"
          className="flex-1 bg-black text-white py-4 px-8 uppercase font-bold text-sm tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="flex-1 border-2 border-black py-4 px-8 uppercase font-bold text-sm tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" /> Back Home
        </Link>
      </div>
    </div>
  );
}
