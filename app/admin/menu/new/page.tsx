"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types";

export default function NewMenuItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", price: "", category_id: "",
    image_url: "", prep_time_minutes: "20", calories: "",
    tags: "", is_featured: false, is_available: true,
  });

  useEffect(() => {
    createClient().from("categories").select("*").order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.category_id) {
      toast.error("Name, price and category are required"); return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("menu_items").insert({
      name:              form.name,
      description:       form.description,
      price:             parseFloat(form.price),
      category_id:       form.category_id,
      image_url:         form.image_url || null,
      prep_time_minutes: parseInt(form.prep_time_minutes) || 20,
      calories:          form.calories ? parseInt(form.calories) : null,
      tags:              form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      is_featured:       form.is_featured,
      is_available:      form.is_available,
    });
    if (error) { toast.error("Failed to add item"); setLoading(false); return; }
    toast.success(`${form.name} added to menu!`);
    router.push("/admin/menu");
  }

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="font-body text-sm text-surface-200/60 block mb-2">{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
        placeholder={placeholder} className="input-base" />
    </div>
  );

  return (
    <div>
      <Link href="/admin/menu" className="inline-flex items-center gap-2 text-sm font-body text-surface-200/50 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Menu
      </Link>
      <h1 className="font-display text-3xl font-bold text-white mb-8">Add Menu Item</h1>

      <div className="card p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Name *", "name", "text", "e.g. Classic Smash Burger")}
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2">Price *</label>
            <input type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)}
              placeholder="12.99" className="input-base" />
          </div>
          <div className="sm:col-span-2">
            <label className="font-body text-sm text-surface-200/60 block mb-2">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Describe the dish..." rows={3} className="input-base resize-none" />
          </div>
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2">Category *</label>
            <select value={form.category_id} onChange={e => set("category_id", e.target.value)}
              className="input-base">
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {field("Prep Time (minutes)", "prep_time_minutes", "number", "20")}
          {field("Calories", "calories", "number", "450")}
          {field("Tags (comma separated)", "tags", "text", "spicy, vegetarian, bestseller")}
          <div className="sm:col-span-2">
            {field("Image URL", "image_url", "url", "https://images.unsplash.com/...")}
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => set("is_featured", e.target.checked)}
              className="w-4 h-4 accent-brand-500" />
            <label htmlFor="featured" className="font-body text-sm text-surface-200/60">Mark as Featured</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="available" checked={form.is_available} onChange={e => set("is_available", e.target.checked)}
              className="w-4 h-4 accent-brand-500" />
            <label htmlFor="available" className="font-body text-sm text-surface-200/60">Available for Order</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
          <button onClick={handleSubmit} disabled={loading} className="btn-brand">
            {loading ? <><Loader2 size={15} className="animate-spin" />Adding...</> : "Add to Menu"}
          </button>
          <Link href="/admin/menu" className="btn-outline">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
