import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify?status=missing", url));
  }

  const sql = getSql();

  const rows = await sql`
    select token, email, expires_at, used_at
    from email_verification_tokens
    where token = ${token}
    limit 1
  `;

  const record = rows[0];

  if (!record) {
    return NextResponse.redirect(new URL("/verify?status=invalid", url));
  }

  if (record.used_at) {
    return NextResponse.redirect(new URL("/verify?status=used", url));
  }

  if (new Date(record.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/verify?status=expired", url));
  }

  // Mark email verified (idempotent)
  await sql`
    insert into verified_emails (email)
    values (${record.email})
    on conflict (email) do update set verified_at = now()
  `;

  // Mark token used
  await sql`
    update email_verification_tokens
    set used_at = now()
    where token = ${token}
  `;

  const response = NextResponse.redirect(new URL("/verify?status=success", url));

  response.cookies.set("verified_email", record.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  return response;
}
