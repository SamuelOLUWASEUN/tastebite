"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, ChefHat } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",       label: "Home"   },
  { href: "/menu",   label: "Menu"   },
  { href: "/orders", label: "Orders" },
];

export function Navbar() {
  const pathname  = usePathname();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin]   = useState(false);
  const [user, setUser]         = useState<any>(null);
  const { toggleCart, totalItems } = useCartStore();
  const count = totalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single()
          .then(({ data: p }) => setIsAdmin(!!p?.is_admin));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setIsAdmin(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-surface-900/95 backdrop-blur-xl border-b border-white/5 py-3"
        : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center group-hover:bg-brand-400 transition-colors">
            <span className="text-white font-display font-bold text-sm">T</span>
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Taste<span className="text-brand-500">Bite</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={cn(
              "px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200",
              pathname === l.href
                ? "bg-white/10 text-white"
                : "text-surface-200/60 hover:text-white hover:bg-white/5"
            )}>{l.label}</Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className={cn(
              "px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 flex items-center gap-1.5",
              pathname.startsWith("/admin")
                ? "bg-brand-500/20 text-brand-400"
                : "text-brand-400/60 hover:text-brand-400 hover:bg-brand-500/10"
            )}>
              <ChefHat size={14} /> Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/account" className={cn(
            "hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-sm font-body transition-all duration-200",
            pathname === "/account"
              ? "bg-white/10 text-white"
              : "text-surface-200/60 hover:text-white hover:bg-white/5"
          )}>
            <User size={16} />
            {user ? "Account" : "Sign In"}
          </Link>

          <button
            onClick={toggleCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-200"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-mono font-bold flex items-center justify-center animate-fade-in">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-surface-900/98 backdrop-blur-xl px-4 py-4 flex flex-col gap-1 animate-fade-in">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-body font-medium transition-all",
                pathname === l.href ? "bg-white/10 text-white" : "text-surface-200/60 hover:text-white hover:bg-white/5"
              )}>{l.label}</Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)}
            className="px-4 py-3 rounded-xl text-sm font-body font-medium text-surface-200/60 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <User size={15} /> {user ? "My Account" : "Sign In"}
          </Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-body font-medium text-brand-400/60 hover:text-brand-400 hover:bg-brand-500/10 flex items-center gap-2">
              <ChefHat size={14} /> Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
