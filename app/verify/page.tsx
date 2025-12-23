export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const raw = sp.status;
  const status = Array.isArray(raw) ? raw[0] : raw;

  // Debug (now allowed)
  console.log("VERIFY status:", status, "raw:", raw, "searchParams:", sp);
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Verify</h1>

        {status === "success" && (
          <>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Email verified ✅</p>
              <p className="text-sm opacity-80">
                Now enter your Minecraft username so we can whitelist you.
              </p>
            </div>

            <form
              className="rounded-lg border p-4 space-y-3"
              action="/api/save-minecraft"
              method="POST"
            >
              <label className="block text-sm font-medium">
                Minecraft username
              </label>
              <input
                name="username"
                required
                minLength={3}
                maxLength={16}
                pattern="^[A-Za-z0-9_]{3,16}$"
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g. Notch"
              />

              <button
                type="submit"
                className="w-full rounded-md bg-black text-white py-2"
              >
                Submit
              </button>

              <p className="text-xs opacity-70">
                Usernames are 3–16 characters: letters, numbers, underscore.
              </p>
            </form>
          </>
        )}

        {status === "mc_saved" && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">Minecraft username saved ✅</p>
            <p className="text-sm opacity-80">
              You’re all set. If whitelisting is automatic, you should be able to
              join soon.
            </p>
          </div>
        )}

        {status !== "success" && status !== "mc_saved" && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">Verification not complete</p>
            <p className="text-sm opacity-80">
              Status: {status ?? "unknown"}.
              {status === "missing" && " The link is missing a token."}
              {status === "invalid" && " This link is invalid."}
              {status === "expired" && " This link expired. Request a new one."}
              {status === "used" && " This link was already used."}
              {status === "bad_username" && " That Minecraft username is invalid."}
              {status === "no_cookie" && " Please click the verify link again."}
              {status === "not_verified" && " Please verify your email first."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
