"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Clock, Loader2 } from "lucide-react";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { OrderStatusTracker } from "@/components/orders/OrderStatusTracker";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setError("Please sign in to view this order"); setLoading(false); return; }
      supabase
        .from("orders")
        .select("*, order_items(*, menu_item:menu_items(*))")
        .eq("id", params.id)
        .eq("user_id", data.user.id)
        .single()
        .then(({ data: order, error: err }) => {
          if (err || !order) setError("Order not found");
          else setOrder(order);
          setLoading(false);
        });
    });
  }, [params.id]);

  if (loading) return (
    <div className="pt-32 min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-brand-400" />
    </div>
  );

  if (error) return (
    <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="text-5xl">😕</div>
      <h1 className="font-display text-2xl font-bold text-white">{error}</h1>
      <Link href="/orders" className="btn-brand">My Orders</Link>
    </div>
  );

  const isActive = !["delivered","cancelled"].includes(order.status);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-body text-surface-200/50 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> All Orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-surface-200/30 mb-1">Order #{order.id.slice(0,8).toUpperCase()}</p>
            <h1 className="font-display text-3xl font-bold text-white">Track Order</h1>
            <p className="font-body text-sm text-surface-200/50 mt-1">{formatDate(order.created_at)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-mono border ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        {/* Status tracker */}
        <div className="card p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-white mb-6">Order Status</h2>
          <OrderStatusTracker status={order.status} />
          {isActive && (
            <div className="mt-6 flex items-center gap-2 text-sm font-body text-surface-200/50">
              <Clock size={14} className="text-brand-400" />
              Estimated delivery in {order.estimated_delivery_minutes ?? 35} minutes
            </div>
          )}
        </div>

        {/* Delivery info */}
        {order.delivery_address && (
          <div className="card p-5 mb-6">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-body font-medium text-white text-sm">Delivery Address</p>
                <p className="font-body text-sm text-surface-200/50 mt-0.5">{order.delivery_address}</p>
                {order.delivery_notes && (
                  <p className="font-body text-xs text-surface-200/30 mt-1">Note: {order.delivery_notes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card p-5 mb-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 items-center">
                {item.menu_item?.image_url && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.menu_item.image_url} alt={item.menu_item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-white text-sm">{item.menu_item?.name ?? "Item"}</p>
                  {item.notes && <p className="font-body text-xs text-surface-200/30">{item.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-sm text-white">×{item.quantity}</p>
                  <p className="font-mono text-xs text-surface-200/40">{formatPrice(item.unit_price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm font-body text-surface-200/50">
              <span>Subtotal</span>
              <span className="font-mono text-white">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="font-body text-white">Total Paid</span>
              <span className="font-mono text-brand-400 text-lg">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {order.status === "delivered" && (
            <Link href="/menu" className="btn-brand flex-1 text-center py-3.5">Order Again</Link>
          )}
          <Link href="/orders" className="btn-outline flex-1 text-center py-3.5">All Orders</Link>
        </div>
      </div>
    </div>
  );
}
