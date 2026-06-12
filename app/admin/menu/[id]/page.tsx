export const dynamic = 'force-dynamic'
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Category, MenuItem } from "@/types";

export default function EditMenuItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [item, setItem]         = useState<MenuItem | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", category_id: "",
    image_url: "", prep_time_minutes: "20", calories: "",
    tags: "", is_featured: false, is_available: true,
  });

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").eq("id", params.id).single(),
    ]).then(([{ data: cats }, { data: item }]) => {
      setCategories(cats ?? []);
      if (item) {
        setItem(item);
        setForm({
          name:              item.name,
          description:       item.description,
          price:             String(item.price),
          category_id:       item.category_id ?? "",
          image_url:         item.image_url ?? "",
          prep_time_minutes: String(item.prep_time_minutes),
          calories:          item.calories ? String(item.calories) : "",
          tags:              item.tags?.join(", ") ?? "",
          is_featured:       item.is_featured,
          is_available:      item.is_available,
        });
      }
    });
  }, [params.id]);

  function set(key: string, value: any) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSave() {
    setLoading(true);
    const { error } = await createClient().from("menu_items").update({
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
    }).eq("id", params.id);
    if (error) toast.error("Failed to update item");
    else { toast.success("Item updated!"); router.push("/admin/menu"); }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    const { error } = await createClient().from("menu_items").delete().eq("id", params.id);
    if (error) { toast.error("Delete failed"); setDeleting(false); return; }
    toast.success("Item deleted");
    router.push("/admin/menu");
  }

  if (!item) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={24} className="animate-spin text-brand-400" />
    </div>
  );

  return (
    <div>
      <Link href="/admin/menu" className="inline-flex items-center gap-2 text-sm font-body text-surface-200/50 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Menu
      </Link>
      <h1 className="font-display text-3xl font-bold text-white mb-8">Edit Item</h1>
      <div className="card p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["Name *", "name", "text", "Item name"],
            ["Price *", "price", "number", "12.99"],
          ].map(([label, key, type, placeholder]) => (
            <div key={key}>
              <label className="font-body text-sm text-surface-200/60 block mb-2">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                placeholder={placeholder} className="input-base" />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="font-body text-sm text-surface-200/60 block mb-2">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              rows={3} className="input-base resize-none" />
          </div>
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2">Category *</label>
            <select value={form.category_id} onChange={e => set("category_id", e.target.value)} className="input-base">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2">Prep Time (min)</label>
            <input type="number" value={form.prep_time_minutes} onChange={e => set("prep_time_minutes", e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2">Calories</label>
            <input type="number" value={form.calories} onChange={e => set("calories", e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)} className="input-base" placeholder="spicy, vegan" />
          </div>
          <div className="sm:col-span-2">
            <label className="font-body text-sm text-surface-200/60 block mb-2">Image URL</label>
            <input type="url" value={form.image_url} onChange={e => set("image_url", e.target.value)} className="input-base" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="feat" checked={form.is_featured} onChange={e => set("is_featured", e.target.checked)} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="feat" className="font-body text-sm text-surface-200/60">Mark as Featured</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="avail" checked={form.is_available} onChange={e => set("is_available", e.target.checked)} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="avail" className="font-body text-sm text-surface-200/60">Available for Order</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
          <button onClick={handleSave} disabled={loading} className="btn-brand">
            {loading ? <><Loader2 size={15} className="animate-spin" />Saving...</> : "Save Changes"}
          </button>
          <Link href="/admin/menu" className="btn-outline">Cancel</Link>
          <button onClick={handleDelete} disabled={deleting}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 text-red-400 text-sm font-body hover:bg-red-500/10 transition-all">
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

