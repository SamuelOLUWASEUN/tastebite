import { createClient } from "@/supabase/server";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const supabase = createClient();

  const [
    { count: totalOrders },
    { count: totalUsers },
    { data: revenue },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount").neq("status", "cancelled"),
    supabase.from("orders")
      .select("*, order_items(count)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const totalRevenue = revenue?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0;

  const stats = [
    { label: "Total Orders",   value: totalOrders ?? 0,          icon: ShoppingBag, accent: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Total Revenue",  value: formatPrice(totalRevenue),  icon: DollarSign,  accent: "text-brand-400",  bg: "bg-brand-500/10" },
    { label: "Registered Users", value: totalUsers ?? 0,          icon: Users,       accent: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Avg. Order",     value: totalOrders ? formatPrice(totalRevenue / totalOrders) : "$0",
                                                                   icon: TrendingUp,  accent: "text-green-400",  bg: "bg-green-500/10" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.accent} />
            </div>
            <p className="font-display text-2xl font-bold text-white">{s.value}</p>
            <p className="font-body text-xs text-surface-200/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-white">Recent Orders</h2>
          <a href="/admin/orders" className="font-body text-sm text-brand-400 hover:text-brand-300 transition-colors">View all →</a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Order ID", "Date", "Items", "Total", "Status"].map(h => (
                <th key={h} className="text-left pb-3 font-mono text-xs text-surface-200/30 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders?.map((order: any) => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="py-3 font-mono text-xs text-surface-200/50">#{order.id.slice(0,8).toUpperCase()}</td>
                <td className="py-3 font-body text-sm text-surface-200/50">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="py-3 font-mono text-sm text-white">{order.order_items?.[0]?.count ?? 0}</td>
                <td className="py-3 font-mono text-sm text-brand-400">{formatPrice(order.total_amount)}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono border capitalize
                    ${order.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : order.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : order.status === "preparing" ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
