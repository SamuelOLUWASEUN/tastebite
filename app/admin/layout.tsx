export const dynamic = 'force-dynamic'
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, UtensilsCrossed, ClipboardList, ChefHat } from "lucide-react";

const adminLinks = [
  { href: "/admin",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu",   label: "Menu Items", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders",    icon: ClipboardList },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/account");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) redirect("/account");

  return (
    <div className="pt-16 min-h-screen flex">
      <aside className="w-56 flex-shrink-0 bg-surface-800 border-r border-white/5 flex flex-col p-4 sticky top-16 h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-2 px-3 py-3 mb-4">
          <ChefHat size={18} className="text-brand-400" />
          <span className="font-display font-bold text-white text-base">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-1">
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-surface-200/60 hover:text-white hover:bg-white/5 transition-all">
              <Icon size={15} />{label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
