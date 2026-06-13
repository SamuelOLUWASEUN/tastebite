import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from("menu_items")
    .select("*", { count: "exact" })
    .eq("is_available", true);

  return NextResponse.json({
    hasUrl,
    hasKey,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    itemCount: count,
    error: error?.message ?? null,
    firstItem: data?.[0] ?? null,
  });
}
