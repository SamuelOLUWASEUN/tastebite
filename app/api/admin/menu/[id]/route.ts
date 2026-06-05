import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
  return !!data?.is_admin;
}

// PATCH /api/admin/menu/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(supabase, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("menu_items").update(body).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE /api/admin/menu/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(supabase, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("menu_items").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
