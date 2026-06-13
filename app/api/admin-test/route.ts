import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(url!, key!);
  
  const { data, error, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .limit(1);

  return NextResponse.json({
    url,
    keyStart: key?.substring(0, 30),
    keyEnd: key?.substring(key.length - 10),
    count,
    error: error?.message ?? null,
  });
}
