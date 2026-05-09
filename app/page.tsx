import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8">
      <h1 className="text-3xl font-bold">Unified Commerce Platform</h1>
      <p className="text-zinc-600">POS + Ecommerce on one shared backend.</p>
      <div className="flex gap-3">
        <Link className="rounded-md bg-black px-4 py-2 text-white" href="/products">
          Browse Store
        </Link>
        <Link className="rounded-md border border-zinc-300 px-4 py-2" href="/login">
          Staff Login
        </Link>
      </div>
    </main>
  );
}
