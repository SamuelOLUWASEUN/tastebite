import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "TasteBite", template: "%s | TasteBite" },
  description: "Fresh, flavourful food delivered to your door.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <CartDrawer />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#1c1a16",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f2f0eb",
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
