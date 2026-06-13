import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const res = await fetch(`${url}/rest/v1/orders?select=id,total_amount&limit=3`, {
    headers: {
      "apikey": key!,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });
  
  const data = await res.json();
  
  return NextResponse.json({
    status: res.status,
    data,
  });
}
