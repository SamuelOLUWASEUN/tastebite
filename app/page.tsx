import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Clock, Truck } from "lucide-react";
import { createClient } from "@/supabase/server";
import { MenuItemCard } from "@/components/menu/MenuItemCard";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("menu_items")
    .select("*, category:categories(*)")
    .eq("is_featured", true)
    .eq("is_available", true)
    .limit(6);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-900 to-surface-800" />
        <div className="absolute inset-0 bg-hero-grain pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />

        {/* Floating food images */}
        <div className="absolute top-24 right-8 md:right-24 w-40 h-40 md:w-64 md:h-64 rounded-3xl overflow-hidden rotate-6 opacity-70 shadow-2xl">
          <Image src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" alt="Burger" fill className="object-cover" />
        </div>
        <div className="absolute bottom-32 left-4 md:left-16 w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden -rotate-3 opacity-60 shadow-2xl">
          <Image src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" alt="Pizza" fill className="object-cover" />
        </div>
        <div className="absolute bottom-16 right-4 md:right-32 w-28 h-28 md:w-40 md:h-40 rounded-3xl overflow-hidden rotate-3 opacity-50 shadow-2xl hidden md:block">
          <Image src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400" alt="Salmon" fill className="object-cover" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-mono mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-soft" />
            Now taking orders · Est. 30 min delivery
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-6 animate-fade-up [animation-delay:100ms]">
            Food that hits<br />
            <em className="text-brand-500 not-italic">different.</em>
          </h1>

          <p className="font-body text-lg md:text-xl text-surface-200/60 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up [animation-delay:200ms]">
            Handcrafted dishes made with premium ingredients, delivered fresh to your door in under 35 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up [animation-delay:300ms]">
            <Link href="/menu" className="btn-brand text-base px-8 py-4">
              Order Now <ArrowRight size={18} />
            </Link>
            <Link href="/menu" className="btn-outline text-base px-8 py-4">
              View Menu
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-14 animate-fade-up [animation-delay:400ms]">
            {[
              { icon: <Star size={16} className="text-brand-400" />, text: "4.9 Rating" },
              { icon: <Clock size={16} className="text-brand-400" />, text: "30 min avg" },
              { icon: <Truck size={16} className="text-brand-400" />, text: "Free over $30" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-sm font-body text-surface-200/50">
                {b.icon} {b.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-brand-400 text-xs tracking-widest uppercase mb-2">Explore</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Browse by Category</h2>
            </div>
            <Link href="/menu" className="hidden sm:flex items-center gap-2 text-sm font-body text-surface-200/50 hover:text-white transition-colors">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-800 border border-white/5 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-200 text-center"
              >
                <div className="text-3xl">{getCategoryEmoji(cat.slug)}</div>
                <span className="font-body font-medium text-sm text-surface-200/70 group-hover:text-white transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      {featured && featured.length > 0 && (
        <section className="py-20 px-4 bg-surface-800/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-mono text-brand-400 text-xs tracking-widest uppercase mb-2">Chef's picks</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Featured Dishes</h2>
              </div>
              <Link href="/menu" className="hidden sm:flex items-center gap-2 text-sm font-body text-surface-200/50 hover:text-white transition-colors">
                Full menu <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-brand-500/10 border border-brand-500/20 p-12 overflow-hidden">
            <div className="absolute inset-0 bg-hero-grain pointer-events-none opacity-50" />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 relative">
              Ready to order?
            </h2>
            <p className="font-body text-surface-200/60 mb-8 text-lg relative">
              Fresh ingredients. Real flavour. Delivered fast.
            </p>
            <Link href="/menu" className="btn-brand px-10 py-4 text-base relative">
              Start Your Order <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-white">
            Taste<span className="text-brand-500">Bite</span>
          </span>
          <p className="font-body text-sm text-surface-200/30">© 2026 TasteBite. All rights reserved.</p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Contact"].map(l => (
              <Link key={l} href="#" className="font-body text-sm text-surface-200/30 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    starters: "🥗", mains: "🍽️", burgers: "🍔", pizzas: "🍕",
    sides: "🍟", desserts: "🍰", drinks: "🥤",
  };
  return map[slug] ?? "🍴";
}
