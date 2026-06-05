"use client";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, MapPin, Loader2, CheckCircle, Clock, Phone, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const [address, setAddress]       = useState("");
  const [notes, setNotes]           = useState("");
  const [phone, setPhone]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId]       = useState("");
  const [error, setError]           = useState("");
  const router  = useRouter();
  const total   = totalPrice();

  // ── Change delivery fee here ──────────────────────────────────
  const FREE_DELIVERY_THRESHOLD = 30;   // free delivery above this amount
  const DELIVERY_FEE_AMOUNT     = 3.99; // delivery fee below threshold
  // ─────────────────────────────────────────────────────────────

  const DELIVERY_FEE = total >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_AMOUNT;
  const GRAND_TOTAL  = total + DELIVERY_FEE;
  const EST_DELIVERY = "25–35 minutes";

  async function placeOrder() {
    setError("");
    if (!address.trim()) { setError("Please enter a delivery address"); return; }
    if (!phone.trim())   { setError("Please enter your phone number");   return; }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/account?next=/cart");
        return;
      }

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id:          user.id,
          total_amount:     GRAND_TOTAL,
          delivery_address: address,
          delivery_notes:   notes ? `Phone: ${phone}. ${notes}` : `Phone: ${phone}`,
          status:           "pending",
          estimated_delivery_minutes: 30,
        })
        .select()
        .single();

      if (orderErr || !order) throw new Error(orderErr?.message ?? "Failed to create order");

      const orderItems = items.map((i) => ({
        order_id:     order.id,
        menu_item_id: i.menuItem.id,
        quantity:     i.quantity,
        unit_price:   i.menuItem.price,
        notes:        i.notes || null,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw new Error(itemsErr.message);

      clearCart();
      setOrderId(order.id.slice(0, 8).toUpperCase());
      setOrderPlaced(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── ORDER SUCCESS SCREEN ───────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
        <div className="max-w-md w-full relative animate-fade-up">

          {/* X close button */}
          <button
            onClick={() => router.push("/")}
            className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-surface-800 border border-white/10 hover:bg-surface-700 hover:border-white/20 flex items-center justify-center text-surface-200/50 hover:text-white transition-all z-10 shadow-lg"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Card */}
          <div className="bg-surface-900 border border-white/8 rounded-3xl p-8 text-center shadow-2xl">

            {/* Animated checkmark */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-brand-500/10 border-2 border-brand-500/30 flex items-center justify-center">
                <CheckCircle size={48} className="text-brand-500" />
              </div>
              <div className="absolute inset-0 rounded-full bg-brand-500/5 animate-ping" />
            </div>

            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Order Placed! 🎉
            </h1>
            <p className="font-display text-lg text-brand-400 mb-6">
              Thank you for your order!
            </p>

            <div className="bg-surface-800 border border-white/5 rounded-2xl p-5 mb-6 text-left space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🍔</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-white text-sm">Order #{orderId}</p>
                  <p className="font-mono text-xs text-surface-200/40">Confirmed and sent to kitchen</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-white text-sm">Estimated Delivery</p>
                  <p className="font-body text-surface-200/50 text-sm">{EST_DELIVERY}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-white text-sm">Expect a Call</p>
                  <p className="font-body text-surface-200/50 text-sm">Our delivery team will call {phone} before arriving</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-white text-sm">Delivering To</p>
                  <p className="font-body text-surface-200/50 text-sm">{address}</p>
                </div>
              </div>

              <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3">
                <p className="font-body text-sm text-surface-200/70 text-center leading-relaxed">
                  🙏 Your food is being freshly prepared. We'll get it to you as fast as possible!
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/orders")}
                className="btn-brand w-full py-3.5"
              >
                Track My Order
              </button>
              <button
                onClick={() => router.push("/")}
                className="btn-outline w-full py-3"
              >
                ✕ Close & Go Home
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ─────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="text-6xl">🛒</div>
        <h1 className="font-display text-3xl font-bold text-white">Your cart is empty</h1>
        <p className="font-body text-surface-200/50">Add some delicious items to get started</p>
        <Link href="/menu" className="btn-brand">Browse Menu</Link>
      </div>
    );
  }

  // ── CHECKOUT FORM ──────────────────────────────────────────────
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/menu" className="inline-flex items-center gap-2 text-sm font-body text-surface-200/50 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Back to menu
        </Link>

        <h1 className="font-display text-4xl font-bold text-white mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-display text-xl font-semibold text-white mb-4">Your Order</h2>
            {items.map((item) => (
              <div key={item.menuItem.id} className="flex gap-4 p-4 card group">
                {item.menuItem.image_url && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.menuItem.image_url} alt={item.menuItem.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-body font-semibold text-white">{item.menuItem.name}</p>
                    <p className="font-mono font-bold text-brand-400 flex-shrink-0">{formatPrice(item.menuItem.price * item.quantity)}</p>
                  </div>
                  <p className="font-mono text-xs text-surface-200/30 mt-0.5">{formatPrice(item.menuItem.price)} each</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white">
                        <Minus size={13} />
                      </button>
                      <span className="font-mono text-sm text-white w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-brand-500/20 hover:bg-brand-500/30 flex items-center justify-center text-brand-400">
                        <Plus size={13} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.menuItem.id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-body text-red-400 hover:text-red-300 transition-all">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary + delivery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6">
              <h2 className="font-display text-xl font-semibold text-white mb-6">Delivery Details</h2>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-surface-200/60 block mb-2">
                    <Phone size={13} className="inline mr-1.5" />Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-surface-200/60 block mb-2">
                    <MapPin size={13} className="inline mr-1.5" />Delivery Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address..."
                    rows={3}
                    className="input-base resize-none"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-surface-200/60 block mb-2">Special Instructions</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Leave at door, ring bell..."
                    className="input-base"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-white">Order Summary</h2>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between text-surface-200/60">
                  <span>Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</span>
                  <span className="font-mono text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-surface-200/60">
                  <span>Delivery fee</span>
                  <span className="font-mono text-white">
                    {DELIVERY_FEE === 0
                      ? <span className="text-green-400">Free 🎉</span>
                      : formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
                {DELIVERY_FEE > 0 && (
                  <p className="text-xs text-brand-400/70">
                    Add {formatPrice(FREE_DELIVERY_THRESHOLD - total)} more for free delivery!
                  </p>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="font-mono text-brand-400 text-lg">{formatPrice(GRAND_TOTAL)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="btn-brand w-full py-4 text-base"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Placing Order...</>
                  : `Place Order — ${formatPrice(GRAND_TOTAL)}`}
              </button>
              <p className="text-xs font-body text-surface-200/30 text-center">
                🕐 Estimated delivery: {EST_DELIVERY}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
