"use client";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ORDER_STATUS_STEPS } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { useRouter } from "next/navigation";

const ALL_STATUSES: OrderStatus[] = ["pending","confirmed","preparing","ready","delivered","cancelled"];

export function AdminOrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: OrderStatus) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { toast.error("Failed to update status"); }
    else { setStatus(newStatus); toast.success(`Order marked as ${newStatus}`); router.refresh(); }
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-body text-xs text-surface-200/30 mr-1">Update:</span>
      {ALL_STATUSES.filter(s => s !== status).map(s => (
        <button
          key={s}
          onClick={() => updateStatus(s)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all disabled:opacity-40 capitalize
            ${s === "cancelled"
              ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
              : s === "delivered"
              ? "border-green-500/20 text-green-400 hover:bg-green-500/10"
              : "border-white/10 text-surface-200/60 hover:text-white hover:border-white/20"
            }`}
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : s}
        </button>
      ))}
    </div>
  );
}
