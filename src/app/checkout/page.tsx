"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ShippingSelector } from "@/components/checkout/ShippingSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { BillingAddress, ShippingRate } from "@/types/checkout";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { orderApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const router = useRouter();
  const [billingData, setBillingData] = useState<Partial<BillingAddress>>({});
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("shipping");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("checkout-payment");
    channel.onmessage = (event: MessageEvent<{ orderNumber?: string; transactionStatus?: string }>) => {
      if (!event.data.orderNumber) return;
      const params = new URLSearchParams({ orderNumber: event.data.orderNumber });
      if (event.data.transactionStatus) {
        params.set("transaction_status", event.data.transactionStatus);
      }
      router.replace(`/checkout/success?${params.toString()}`);
    };
    return () => channel.close();
  }, [router]);

  const isFormValid = 
    billingData.firstName && 
    billingData.lastName && 
    billingData.email && 
    billingData.phone && 
    (deliveryMethod === "pickup" || (billingData.areaId && billingData.address)) && 
    (deliveryMethod === "pickup" || shippingRate);

  const handlePlaceOrder = async () => {
    if (!isFormValid) return;
    setSubmitError("");
    setIsSubmitting(true);
    const paymentWindow = window.open("about:blank", "_blank");
    if (!paymentWindow) {
      setSubmitError("Izinkan pop-up untuk membuka halaman pembayaran Midtrans.");
      setIsSubmitting(false);
      return;
    }
    paymentWindow.opener = null;

    try {
      const customerName = `${billingData.firstName} ${billingData.lastName}`.trim();
      const shippingAddress =
        deliveryMethod === "pickup"
          ? undefined
          : [
              billingData.address,
              billingData.district_name,
              billingData.city_name,
              billingData.province_name,
              billingData.postcode,
            ]
              .filter(Boolean)
              .join(", ");
      const items = cart.map((item) => {
        const variant =
          item.variant ??
          item.product.variants?.find(
            (candidate) => candidate.isActive && candidate.stock > 0,
          );
        if (!variant) {
          throw new Error(
            `${item.product.title} tidak memiliki varian yang tersedia. Hapus produk ini dari keranjang lalu pilih varian yang tersedia.`,
          );
        }
        return {
          productVariantId: variant.id,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
        };
      });

      const order = await orderApi.create({
        customerName,
        customerEmail: billingData.email!,
        customerPhone: billingData.phone!,
        shippingMethod: deliveryMethod === "pickup" ? "PICKUP_STORE" : "SHIPPING",
        shippingAddress,
        storeLocation:
          deliveryMethod === "pickup"
            ? "Wellborn Flagship Store, Jl. Sultan Agung No. 24, Bandung"
            : undefined,
        shippingCourier:
          deliveryMethod === "shipping" ? shippingRate?.courier_name : undefined,
        shippingCost: deliveryMethod === "shipping" ? shippingRate?.price ?? 0 : 0,
        items,
      });

      if (!order.snapRedirectUrl) {
        throw new Error("Backend tidak mengembalikan URL pembayaran Midtrans.");
      }
      paymentWindow.location.replace(order.snapRedirectUrl);
      setPaymentStarted(true);
      setIsSubmitting(false);
    } catch (error) {
      paymentWindow.close();
      setSubmitError(
        error instanceof Error ? error.message : "Gagal membuat pembayaran.",
      );
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest">Your cart is empty</h2>
        <Link href="/products" className="bg-black text-white px-8 py-3 uppercase text-sm font-bold hover:bg-gray-800 transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-8">
        <Link href="/products" className="text-xs font-bold uppercase flex items-center gap-2 hover:opacity-70 transition-opacity">
          <ArrowLeft className="h-3 w-3" /> Back to Products
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter mt-4">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setDeliveryMethod("shipping");
                setShippingRate(null);
              }}
              className={`flex-1 py-4 border-2 font-bold uppercase transition-all ${
                deliveryMethod === "shipping" ? "border-black bg-black text-white" : "border-gray-200 text-muted-foreground"
              }`}
            >
              Delivery Shipping
            </button>
            <button
              onClick={() => {
                setDeliveryMethod("pickup");
                setShippingRate({
                   courier_name: "Store Pickup",
                   courier_code: "PICKUP",
                   courier_service_name: "Self Pickup",
                   courier_service_code: "PICKUP",
                   price: 0,
                   duration: "Same Day"
                });
              }}
              className={`flex-1 py-4 border-2 font-bold uppercase transition-all ${
                deliveryMethod === "pickup" ? "border-black bg-black text-white" : "border-gray-200 text-muted-foreground"
              }`}
            >
              Ambil di Store
            </button>
          </div>

          <CheckoutForm 
            deliveryMethod={deliveryMethod}
            onChange={(data) => setBillingData(prev => ({ ...prev, ...data }))} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t" style={{ borderColor: "var(--surface-border)" }}>
            {deliveryMethod === "shipping" ? (
              <ShippingSelector 
                billingData={billingData} 
                items={cart} 
                onSelect={(rate) => setShippingRate(rate)} 
              />
            ) : (
              <div className="p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center space-y-2" style={{ borderColor: "var(--surface-border)" }}>
                <p className="text-sm font-bold uppercase">Store Location</p>
                <p className="text-xs text-muted-foreground">Wellborn Flagship Store<br/>Jl. Sultan Agung No. 24, Bandung</p>
              </div>
            )}
            <div className="flex flex-col justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center" style={{ borderColor: "var(--surface-border)" }}>
              <p className="text-sm font-bold uppercase">Secure payment by Midtrans</p>
              <p className="text-xs text-muted-foreground">Choose your payment method on the Midtrans payment page after placing your order.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-4 sticky top-24 self-start">
          <OrderSummary 
            items={cart} 
            subtotal={cartTotal} 
            shippingRate={shippingRate} 
          />
          
          <button
            onClick={handlePlaceOrder}
            disabled={!isFormValid || isSubmitting || paymentStarted}
            className={`w-full mt-6 py-4 uppercase font-bold tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
              isFormValid && !isSubmitting && !paymentStarted
                ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 scale-[1.02]"
                : "bg-surface text-muted-foreground opacity-50 cursor-not-allowed border border-dashed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Processing...
              </>
            ) : (
              paymentStarted ? "Payment Opened in New Tab" : "Pay with Midtrans"
            )}
          </button>
          {paymentStarted && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Selesaikan pembayaran di tab Midtrans yang baru. Halaman ini akan
              berpindah setelah Midtrans mengembalikan hasil pembayaran.
            </p>
          )}
          {submitError && (
            <p role="alert" className="mt-3 text-center text-sm text-red-600">
              {submitError}
            </p>
          )}
          
          {!isFormValid && (
            <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter">
              Please complete all required fields and select a shipping service.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
