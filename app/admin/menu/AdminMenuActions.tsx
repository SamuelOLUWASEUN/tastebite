"use client";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminMenuActions({
  itemId,
  isAvailable,
  isFeatured,
}: {
  itemId: string;
  isAvailable: boolean;
  isFeatured: boolean;
}) {
  const [available, setAvailable] = useState(isAvailable);
  const [featured, setFeatured]   = useState(isFeatured);
  const [loading, setLoading]     = useState(false);
  const router = useRouter();

  async function toggle(field: "is_available" | "is_featured", value: boolean) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("menu_items").update({ [field]: value }).eq("id", itemId);
    if (error) toast.error("Update failed");
    else {
      if (field === "is_available") setAvailable(value);
      else setFeatured(value);
      toast.success("Updated!");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={() => toggle("is_featured", !featured)}
        disabled={loading}
        title={featured ? "Remove from featured" : "Mark as featured"}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          featured ? "bg-brand-500/20 text-brand-400" : "bg-white/5 text-surface-200/30 hover:text-white"
        }`}
      >
        <Star size={14} fill={featured ? "currentColor" : "none"} />
      </button>
      <button
        onClick={() => toggle("is_available", !available)}
        disabled={loading}
        title={available ? "Mark unavailable" : "Mark available"}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          available ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
        }`}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : available ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  );
}
