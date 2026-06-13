import { createAdminClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, total_amount")
    .limit(3);

  return NextResponse.json({ error: error?.message ?? null, data });
}
