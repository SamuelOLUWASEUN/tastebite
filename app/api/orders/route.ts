import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

// GET /api/orders — fetch current user's orders
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, menu_item:menu_items(name,price,image_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/orders — place a new order
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { items, delivery_address, delivery_notes } = body;

  if (!items?.length || !delivery_address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch real prices from DB — never trust client-side prices
  const itemIds = items.map((i: any) => i.menu_item_id);
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, price, is_available")
    .in("id", itemIds);

  if (!menuItems) return NextResponse.json({ error: "Menu items not found" }, { status: 400 });

  const unavailable = menuItems.filter(m => !m.is_available);
  if (unavailable.length > 0) {
    return NextResponse.json({ error: "Some items are no longer available" }, { status: 400 });
  }

  const priceMap = Object.fromEntries(menuItems.map(m => [m.id, m.price]));
  const subtotal = items.reduce(
    (sum: number, i: any) => sum + (priceMap[i.menu_item_id] ?? 0) * i.quantity,
    0
  );
  const deliveryFee = subtotal >= 30 ? 0 : 3.99;
  const totalAmount = subtotal + deliveryFee;

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      delivery_address,
      delivery_notes: delivery_notes ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message ?? "Failed to create order" }, { status: 500 });
  }

  // Create order items
  const orderItems = items.map((i: any) => ({
    order_id:     order.id,
    menu_item_id: i.menu_item_id,
    quantity:     i.quantity,
    unit_price:   priceMap[i.menu_item_id],
    notes:        i.notes ?? null,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
  if (itemsErr) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  return NextResponse.json({ data: order }, { status: 201 });
}
