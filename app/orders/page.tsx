"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import Link from "next/link";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_STEPS } from "@/lib/utils";
import { ArrowRight, Package, Clock, ShoppingBag } from "lucide-react";

const STATUS_ICONS: Record<string, string> = {
  pending:   "⏳",
  confirmed: "✅",
  preparing: "👨‍🍳",
  ready:     "📦",
  delivered: "🎉",
  cancelled: "❌",
};

export default function OrdersPage() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser]       = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        supabase
          .from("orders")
          .select("*, order_items(*, menu_item:menu_items(name, image_url))")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })
          .then(({ data: orders }) => {
            setOrders(orders ?? []);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const active    = orders.filter(o => !["delivered","cancelled"].includes(o.status));
  const completed = orders.filter(o => ["delivered","cancelled"].includes(o.status));

  // ── NOT LOGGED IN ──────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center">
          <Package size={28} className="text-surface-200/30" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Sign in to view orders</h1>
          <p className="font-body text-surface-200/50 text-sm">You need to be signed in to see your order history</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/account" className="btn-brand">Sign In</Link>
          <Link href="/menu" className="btn-outline">Browse Menu</Link>
        </div>
      </div>
    );
  }

  // ── LOADING ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-surface-200/50 text-sm">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // ── NO ORDERS ──────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center">
          <ShoppingBag size={28} className="text-surface-200/30" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">No orders yet</h1>
          <p className="font-body text-surface-200/50 text-sm">Your order history will appear here once you place an order</p>
        </div>
        <Link href="/menu" className="btn-brand">
          <ShoppingBag size={16} /> Order Now
        </Link>
      </div>
    );
  }

  // ── ORDERS LIST ────────────────────────────────────────────────
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <p className="font-mono text-brand-400 text-xs tracking-widest uppercase mb-2">Your History</p>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">My Orders</h1>
            <p className="font-body text-surface-200/50 text-sm mt-1">
              {orders.length} total order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/menu" className="btn-brand text-sm px-5 py-2.5">
            <ShoppingBag size={15} /> New Order
          </Link>
        </div>

        <div className="space-y-8">

          {/* ── Active Orders ── */}
          {active.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse inline-block" />
                Active Orders
              </h2>
              <div className="space-y-4">
                {active.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block card p-5 hover:border-brand-500/30 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-lg">{STATUS_ICONS[order.status]}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-mono border ${ORDER_STATUS_COLORS[order.status]}`}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-surface-200/30 mt-1">
                          #{order.id.slice(0,8).toUpperCase()}
                        </p>
                        <p className="font-body text-xs text-surface-200/40 mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-white text-lg">{formatPrice(order.total_amount)}</p>
                        <p className="font-body text-xs text-brand-400 mt-1 group-hover:underline">Track order →</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-1 mb-3">
                      {ORDER_STATUS_STEPS.map((step, i) => {
                        const currentIdx = ORDER_STATUS_STEPS.indexOf(order.status);
                        const done = i <= currentIdx;
                        return (
                          <div key={step} className={`h-1.5 flex-1 rounded-full transition-all ${done ? "bg-brand-500" : "bg-white/10"}`} />
                        );
                      })}
                    </div>

                    <p className="font-body text-sm text-surface-200/50 truncate">
                      {order.order_items?.map((i: any) => i.menu_item?.name).filter(Boolean).join(", ")}
                    </p>

                    {order.estimated_delivery_minutes && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                        <Clock size={13} className="text-brand-400" />
                        <span className="font-body text-xs text-surface-200/50">
                          Estimated delivery in {order.estimated_delivery_minutes} minutes
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Order History ── */}
          {completed.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-white mb-4">Order History</h2>
              <div className="space-y-3">
                {completed.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block card p-5 hover:border-white/10 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-base">{STATUS_ICONS[order.status]}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${ORDER_STATUS_COLORS[order.status]}`}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                          <span className="font-mono text-xs text-surface-200/30">
                            #{order.id.slice(0,8).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-body text-xs text-surface-200/40 mb-2">
                          🗓 {formatDate(order.created_at)}
                        </p>
                        <p className="font-body text-sm text-surface-200/50 truncate">
                          {order.order_items?.map((i: any) => `${i.menu_item?.name} ×${i.quantity}`).filter(Boolean).join(", ")}
                        </p>
                        <p className="font-body text-xs text-surface-200/30 mt-1">
                          {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-white">{formatPrice(order.total_amount)}</p>
                        <ArrowRight size={14} className="text-surface-200/30 group-hover:text-brand-400 transition-colors mt-2 ml-auto" />
                      </div>
                    </div>

                    {order.status === "delivered" && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="font-body text-xs text-brand-400">+ Order again →</span>
                        <span className="font-body text-xs text-surface-200/30">Click to view details</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
