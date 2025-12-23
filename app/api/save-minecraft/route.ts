import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

function isValidMcUsername(u: string) {
  return /^[A-Za-z0-9_]{3,16}$/.test(u);
}

export async function POST(req: Request) {

    const cookieStore = await cookies();
  const form = await req.formData();
  const username = String(form.get("username") ?? "").trim();

  if (!isValidMcUsername(username)) {
    return NextResponse.redirect(new URL("/verify?status=bad_username", req.url));
  }

  const email = cookieStore.get("verified_email")?.value;
  if (!email) {
    return NextResponse.redirect(new URL("/verify?status=no_cookie", req.url));
  }

  const sql = getSql();

  // Make sure the email is verified
  const verified = await sql`
    select email from verified_emails where email = ${email} limit 1
  `;
  if (verified.length === 0) {
    return NextResponse.redirect(new URL("/verify?status=not_verified", req.url));
  }

  // Save MC username
  await sql`
    update verified_emails
    set minecraft_username = ${username}
    where email = ${email}
  `;

  // Clear cookie after use (optional)
  const res = NextResponse.redirect(new URL("/verify?status=mc_saved", req.url));
  res.cookies.set("verified_email", "", { path: "/", maxAge: 0 });
  return res;
}
