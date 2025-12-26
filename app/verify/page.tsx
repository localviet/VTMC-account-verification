// app/verify/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Phase = "idle" | "confirming" | "confirmed" | "error";

export default function VerifyPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const token = sp.get("token");
  const status = sp.get("status"); // keep compatibility with old links if you want

  const [phase, setPhase] = useState<Phase>(() => {
    if (status === "mc_saved") return "confirmed";
    if (status === "success") return "confirmed";
    return "idle";
  });

  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const canConfirm = useMemo(() => typeof token === "string" && token.length > 0, [token]);

  async function confirmEmail() {
    if (!canConfirm || !token) return;

    setPhase("confirming");
    setErrorStatus(null);

    const res = await fetch("/api/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ token }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setPhase("confirmed");
      // optional: strip token from the URL after success
      router.replace("/verify?status=success");
    } else {
      setPhase("error");
      setErrorStatus(data?.error ?? "unknown");
      // optional: show the status in URL too
      router.replace(`/verify?status=${encodeURIComponent(data?.error ?? "unknown")}`);
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Verify</h1>

        {/* If we still support old status links */}
        {status === "mc_saved" && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">Minecraft username saved ✅</p>
            <p className="text-sm opacity-80">
              You’re all set. If whitelisting is automatic, you should be able to join soon.
            </p>
          </div>
        )}

        {/* New flow: token-based confirmation */}
        {phase !== "confirmed" && status !== "mc_saved" && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="font-medium">Confirm your email</p>

            {!token && (
              <p className="text-sm opacity-80">
                Missing token. Please use the verification link from your email.
              </p>
            )}

            {token && (
              <p className="text-sm opacity-80">
                Click confirm to verify your email. (This prevents email scanners from consuming your token.)
              </p>
            )}

            <button
              onClick={confirmEmail}
              disabled={!token || phase === "confirming"}
              className="w-full rounded-md bg-black text-white py-2 disabled:opacity-60"
            >
              {phase === "confirming" ? "Confirming..." : "Confirm email"}
            </button>

            {(phase === "error" || status) && (
              <p className="text-xs opacity-70">
                Status: {errorStatus ?? status ?? "unknown"}
              </p>
            )}
          </div>
        )}

        {/* After confirmed: show MC username form (same as you already have) */}
        {phase === "confirmed" && status !== "mc_saved" && (
          <>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Email verified ✅</p>
              <p className="text-sm opacity-80">
                Now enter your Minecraft username so we can whitelist you.
              </p>
            </div>

            <form className="rounded-lg border p-4 space-y-3" action="/api/save-minecraft" method="POST">
              <label className="block text-sm font-medium">Minecraft username</label>
              <input
                name="username"
                required
                minLength={3}
                maxLength={16}
                pattern="^[A-Za-z0-9_]{3,16}$"
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g. Notch"
              />

              <button type="submit" className="w-full rounded-md bg-black text-white py-2">
                Submit
              </button>

              <p className="text-xs opacity-70">
                Usernames are 3–16 characters: letters, numbers, underscore.
              </p>
            </form>
          </>
        )}

        {/* Old statuses display (optional; keep what you had) */}
        {phase !== "confirmed" && status && status !== "mc_saved" && status !== "success" && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">Verification not complete</p>
            <p className="text-sm opacity-80">
              Status: {status}.
              {status === "missing" && " The link is missing a token."}
              {status === "invalid" && " This link is invalid."}
              {status === "expired" && " This link expired. Request a new one."}
              {status === "used" && " This link was already used."}
              {status === "no_cookie" && " Please click the verify link again."}
              {status === "not_verified" && " Please verify your email first."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

