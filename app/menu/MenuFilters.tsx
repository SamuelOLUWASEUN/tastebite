"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function MenuFilters({
  categories,
  active,
  query,
}: {
  categories: Category[];
  active: string;
  query: string;
}) {
  const router      = useRouter();
  const params      = useSearchParams();
  const [, start]   = useTransition();
  const [q, setQ]   = useState(query);

  function navigate(category: string, search: string) {
    const p = new URLSearchParams(params.toString());
    if (category && category !== "all") p.set("category", category);
    else p.delete("category");
    if (search) p.set("q", search);
    else p.delete("q");
    start(() => router.push(`/menu?${p.toString()}`));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-5">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-200/30" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && navigate(active, q)}
          placeholder="Search dishes..."
          className="input-base pl-9 pr-9"
        />
        {q && (
          <button
            onClick={() => { setQ(""); navigate(active, ""); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-200/30 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => navigate("all", q)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200",
            active === "all"
              ? "bg-brand-500 text-white"
              : "bg-surface-800 border border-white/5 text-surface-200/60 hover:text-white hover:border-white/10"
          )}
        >All</button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(cat.slug, q)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200",
              active === cat.slug
                ? "bg-brand-500 text-white"
                : "bg-surface-800 border border-white/5 text-surface-200/60 hover:text-white hover:border-white/10"
            )}
          >{cat.name}</button>
        ))}
      </div>
    </div>
  );
}
