import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const q        = searchParams.get("q");

  const supabase = createClient();
  let query = supabase
    .from("menu_items")
    .select("*, category:categories(id,name,slug)")
    .eq("is_available", true)
    .order("is_featured", { ascending: false });

  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (featured === "true") query = query.eq("is_featured", true);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
