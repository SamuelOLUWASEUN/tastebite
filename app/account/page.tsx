"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, MapPin, LogOut } from "lucide-react";

type Tab = "login" | "signup";

function AccountContent() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") ?? "/";

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        supabase.from("profiles").select("*").eq("id", data.user.id).single()
          .then(({ data: p }) => setProfile(p));
      }
      setPageLoading(false);
    });
  }, []);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Welcome back!");
    router.push(nextPath);
    router.refresh();
  }

  async function handleSignup() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Account created! Check your email to confirm.");
    setLoading(false);
  }

  async function handleUpdateProfile() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name || profile?.full_name, phone, default_address: address })
      .eq("id", user.id);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  if (pageLoading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-400" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="pt-24 pb-20 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <p className="font-mono text-brand-400 text-xs tracking-widest uppercase mb-2">Account</p>
          <h1 className="font-display text-4xl font-bold text-white mb-10">My Profile</h1>
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                <span className="font-display font-bold text-xl text-brand-400">
                  {(profile?.full_name ?? user.email)?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-display font-semibold text-white text-lg">{profile?.full_name ?? "Welcome!"}</p>
                <p className="font-mono text-xs text-surface-200/40">{user.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm text-surface-200/60 block mb-2"><User size={13} className="inline mr-1.5" />Full Name</label>
                <input type="text" defaultValue={profile?.full_name ?? ""} onChange={e => setName(e.target.value)} className="input-base" placeholder="Your name" />
              </div>
              <div>
                <label className="font-body text-sm text-surface-200/60 block mb-2"><Phone size={13} className="inline mr-1.5" />Phone</label>
                <input type="tel" defaultValue={profile?.phone ?? ""} onChange={e => setPhone(e.target.value)} className="input-base" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="font-body text-sm text-surface-200/60 block mb-2"><MapPin size={13} className="inline mr-1.5" />Default Address</label>
                <textarea defaultValue={profile?.default_address ?? ""} onChange={e => setAddress(e.target.value)} className="input-base resize-none" rows={2} placeholder="Your delivery address" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleUpdateProfile} disabled={loading} className="btn-brand">
                {loading ? <Loader2 size={15} className="animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/orders" className="btn-outline flex-1 text-center">View Orders</a>
            <button onClick={handleSignOut} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-red-500/20 text-red-400 text-sm font-body hover:bg-red-500/5 transition-all">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="font-body text-surface-200/50 text-sm">
            {tab === "login" ? "Sign in to track your orders" : "Join TasteBite today"}
          </p>
        </div>
        <div className="flex bg-surface-800 rounded-full p-1 mb-8">
          {(["login", "signup"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"flex-1 py-2.5 rounded-full text-sm font-body font-medium transition-all capitalize " +
                (tab === t ? "bg-brand-500 text-white" : "text-surface-200/50 hover:text-white")}>
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {tab === "signup" && (
            <div>
              <label className="font-body text-sm text-surface-200/60 block mb-2"><User size={13} className="inline mr-1.5" />Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-base" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2"><Mail size={13} className="inline mr-1.5" />Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-base" placeholder="you@example.com" />
          </div>
          <div>
            <label className="font-body text-sm text-surface-200/60 block mb-2"><Lock size={13} className="inline mr-1.5" />Password</label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)} className="input-base" placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && (tab === "login" ? handleLogin() : handleSignup())} />
          </div>
          <button
            onClick={tab === "login" ? handleLogin : handleSignup}
            disabled={loading || !email || !password}
            className="btn-brand w-full py-3.5 text-base mt-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-400" />
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
