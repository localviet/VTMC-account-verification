"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/start-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      // Redirect to your “check your email” page
      router.push("/checkEmail");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold">Join the server</h1>

        <input
          type="email"
          required
          placeholder="you@college.edu"
          className="w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Sending..." : "Verify Email"}
        </button>
      </form>
    </div>
  );
}
