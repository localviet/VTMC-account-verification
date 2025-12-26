import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export const dynamic = "force-dynamic";
export default function VerifyPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <VerifyClient />
    </Suspense>
  );
}

function Fallback() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Verify</h1>
        <div className="rounded-lg border p-4">
          <p className="text-sm opacity-80">Loading…</p>
        </div>
      </div>
    </div>
  );
}
