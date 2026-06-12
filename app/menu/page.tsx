import { createClient } from "@/supabase/server";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { MenuFilters } from "./MenuFilters";

export const metadata = { title: "Menu" };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase  = await createClient();
  const category  = searchParams.category ?? "all";
  const query     = searchParams.q ?? "";

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  let itemQuery = supabase
    .from("menu_items")
    .select("*, category:categories(*)")
    .eq("is_available", true)
    .order("is_featured", { ascending: false });

  if (category !== "all") {
    const cat = categories?.find((c) => c.slug === category);
    if (cat) itemQuery = itemQuery.eq("category_id", cat.id);
  }
  if (query) {
    itemQuery = itemQuery.ilike("name", `%${query}%`);
  }

  const { data: items } = await itemQuery;

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <p className="font-mono text-brand-400 text-xs tracking-widest uppercase mb-2">What are you craving?</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Our Menu</h1>
      </div>

      <MenuFilters categories={categories ?? []} active={category} query={query} />

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {!items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-5xl">🍽️</div>
            <p className="font-display text-2xl text-white/40">Nothing found</p>
            <p className="font-body text-surface-200/30 text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-surface-200/40 mb-6">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
