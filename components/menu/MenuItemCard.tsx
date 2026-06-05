"use client";
import Image from "next/image";
import { Plus, Clock, Flame } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/types";
import { toast } from "sonner";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(item);
    toast.success(`${item.name} added to cart`, {
      description: formatPrice(item.price),
    });
  }

  return (
    <div className="card group hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-surface-800 flex items-center justify-center text-4xl">🍽️</div>
        )}
        {item.is_featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-mono font-bold">
            FEATURED
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-body font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-white text-base leading-tight">{item.name}</h3>
          <span className="font-mono font-bold text-brand-400 text-sm flex-shrink-0">{formatPrice(item.price)}</span>
        </div>
        <p className="font-body text-surface-200/50 text-sm leading-relaxed line-clamp-2 mb-3">{item.description}</p>

        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center gap-1 text-xs text-surface-200/40 font-mono">
            <Clock size={11} /> {item.prep_time_minutes}m
          </span>
          {item.calories && (
            <span className="flex items-center gap-1 text-xs text-surface-200/40 font-mono">
              <Flame size={11} /> {item.calories} cal
            </span>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!item.is_available}
          className="btn-brand w-full py-2.5 text-sm disabled:opacity-40"
        >
          <Plus size={15} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
