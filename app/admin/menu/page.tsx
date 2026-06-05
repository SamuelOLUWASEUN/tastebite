import { createClient } from "@/supabase/server";
import { formatPrice } from "@/lib/utils";
import { AdminMenuActions } from "./AdminMenuActions";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import Image from "next/image";

export const metadata = { title: "Manage Menu" };

export default async function AdminMenuPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("menu_items")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Menu Items</h1>
        <Link href="/admin/menu/new" className="btn-brand text-sm px-5 py-2.5">
          <Plus size={15} /> Add Item
        </Link>
      </div>

      <div className="space-y-3">
        {items?.map((item: any) => (
          <div key={item.id} className="card p-4 flex items-center gap-4">
            {item.image_url ? (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-surface-900 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-body font-semibold text-white">{item.name}</p>
                {item.is_featured && <span className="tag text-brand-400 bg-brand-500/10 border-brand-500/20">Featured</span>}
                {!item.is_available && <span className="tag text-red-400 bg-red-500/10 border-red-500/20">Unavailable</span>}
              </div>
              <p className="font-body text-xs text-surface-200/40 mt-0.5">{item.category?.name}</p>
              <p className="font-mono text-sm text-brand-400 mt-1">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/admin/menu/${item.id}`}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-surface-200/50 hover:text-white transition-all">
                <Pencil size={13} />
              </Link>
              <AdminMenuActions itemId={item.id} isAvailable={item.is_available} isFeatured={item.is_featured} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
