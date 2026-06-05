import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">
      <div className="text-7xl">🍽️</div>
      <div>
        <h1 className="font-display text-6xl font-bold text-white mb-2">404</h1>
        <p className="font-display text-2xl text-surface-200/50">Page not found</p>
        <p className="font-body text-surface-200/30 mt-2 text-sm">Looks like this dish isn't on the menu.</p>
      </div>
      <Link href="/" className="btn-brand px-8 py-3">Back to Home</Link>
    </div>
  );
}
