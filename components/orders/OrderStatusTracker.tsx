import { Check } from "lucide-react";
import { ORDER_STATUS_STEPS, ORDER_STATUS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
        <p className="text-red-400 font-body font-semibold text-sm">Order Cancelled</p>
      </div>
    );
  }

  const currentIdx = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const current = i === currentIdx;
        const last    = i === ORDER_STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 text-xs font-mono font-bold",
                done    ? "bg-brand-500 border-brand-500 text-white"
                : current ? "bg-brand-500/20 border-brand-500 text-brand-400 animate-pulse-soft"
                : "bg-surface-800 border-white/10 text-surface-200/30"
              )}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn(
                "text-xs font-body hidden sm:block text-center leading-tight max-w-16",
                done || current ? "text-white" : "text-surface-200/30"
              )}>
                {ORDER_STATUS_LABELS[step]}
              </span>
            </div>
            {!last && (
              <div className={cn(
                "flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all duration-500",
                done ? "bg-brand-500" : "bg-white/10"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
