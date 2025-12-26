import { NextResponse } from "next/server";
import { getSql } from "@/lib/db"; // adjust path

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  const sql = getSql();

  const rows = await sql`
    select token, email, expires_at, used_at
    from email_verification_tokens
    where token = ${token}
    limit 1
    for update
  `;
  const record = rows[0];

  if (!record) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (record.used_at) return NextResponse.json({ error: "used" }, { status: 400 });
  if (new Date(record.expires_at) < new Date()) return NextResponse.json({ error: "expired" }, { status: 400 });

  await sql`
    insert into verified_emails (email)
    values (${record.email})
    on conflict (email) do update set verified_at = now()
  `;

  await sql`
    update email_verification_tokens
    set used_at = now()
    where token = ${token} and used_at is null
  `;

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");

  res.cookies.set("verified_email", record.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return res;
}
