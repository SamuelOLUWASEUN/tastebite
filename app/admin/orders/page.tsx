export const dynamic = 'force-dynamic'
import { createAdminClient } from "@/supabase/server";
import { formatPrice, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import { AdminOrderActions } from "./AdminOrderActions";

export const metadata = { title: "Manage Orders" };

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*, menu_item:menu_items(name)), profile:profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-8">Orders</h1>
        <p className="text-red-400">Error: {error.message}</p>
        <p className="text-red-400">Details: {JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white mb-8">Orders</h1>
      <div className="space-y-4">
        {!orders || orders.length === 0 ? (
          <p className="text-surface-200/40">No orders found.</p>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-xs text-surface-200/30">#{order.id.slice(0,8).toUpperCase()}</p>
                  <p className="font-body font-semibold text-white mt-0.5">
                    {order.profile?.full_name ?? order.profile?.email ?? "Guest"}
                  </p>
                  <p className="font-body text-xs text-surface-200/40 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono border ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-mono font-bold text-white">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
              <div className="text-sm font-body text-surface-200/50 mb-4">
                {order.order_items?.map((i: any, idx: number) => (
                  <span key={i.id}>{i.menu_item?.name ?? "?"} x{i.quantity}{idx < order.order_items.length - 1 ? ", " : ""}</span>
                ))}
              </div>
              {order.delivery_address && (
                <p className="text-xs font-body text-surface-200/30 mb-4">📍 {order.delivery_address}</p>
              )}
              <AdminOrderActions orderId={order.id} currentStatus={order.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
