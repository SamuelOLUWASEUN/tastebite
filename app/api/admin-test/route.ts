import { createAdminClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .limit(1);

  return NextResponse.json({
    count,
    error: error?.message ?? null,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    firstOrder: data?.[0]?.id ?? null,
  });
}
