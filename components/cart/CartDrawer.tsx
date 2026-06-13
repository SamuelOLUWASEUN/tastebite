"use client";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();
  const total = totalPrice();
  const count = totalItems();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface-800 border-l border-white/5 z-50 flex flex-col animate-slide-in-r">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Your Cart</h2>
            <p className="text-sm text-surface-200/50 font-body mt-0.5">{count} item{count !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={closeCart} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-surface-200/60 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <ShoppingBag size={24} className="text-surface-200/30" />
              </div>
              <div>
                <p className="font-display text-lg text-white/50">Your cart is empty</p>
                <p className="text-sm text-surface-200/30 font-body mt-1">Add some delicious items to get started</p>
              </div>
              <Link href="/menu" onClick={closeCart} className="btn-brand mt-2">Browse Menu</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.menuItem.id} className="flex gap-4 p-4 bg-surface-900/50 rounded-2xl border border-white/5 group">
                {item.menuItem.image_url && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.menuItem.image_url} alt={item.menuItem.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-white text-sm leading-tight truncate">{item.menuItem.name}</p>
                  <p className="text-brand-400 font-mono text-sm font-medium mt-0.5">{formatPrice(item.menuItem.price)}</p>
                  {item.notes && <p className="text-xs text-surface-200/40 mt-1 truncate">{item.notes}</p>}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
                      ><Minus size={12} /></button>
                      <span className="font-mono text-sm text-white w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-brand-500/20 hover:bg-brand-500/30 flex items-center justify-center text-brand-400 transition-all"
                      ><Plus size={12} /></button>
                    </div>
                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all"
                    ><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-surface-200/60">Subtotal</span>
              <span className="font-mono font-bold text-white text-lg">{formatPrice(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-body text-surface-200/40">Delivery fee</span>
              <span className="font-mono text-surface-200/40">Calculated at checkout</span>
            </div>
            <Link href="/cart" onClick={closeCart} className="btn-brand w-full text-center">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

