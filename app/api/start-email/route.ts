import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY");
  return new Resend(key);
}


function isAllowedCollegeEmail(email: string) {
  // change this to your college domain
  return email.toLowerCase().endsWith("@vt.edu") || email.toLowerCase().endsWith("khangho9@icloud.com"); // if ends with college name
}

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const resend = getResend();
  const sql = await getSql();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!isAllowedCollegeEmail(email)) {
    return NextResponse.json(
      { error: "Please use your college email (@college.edu)." },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY." }, { status: 500 });
  }
  if (!process.env.EMAIL_FROM) {
    return NextResponse.json({ error: "Missing EMAIL_FROM." }, { status: 500 });
  }

  // 1) Generate token
  const token = crypto.randomBytes(32).toString("hex");
  //SQL
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
    // Save token -> email
    await sql`
        insert into email_verification_tokens (token, email, expires_at)
        values (${token}, ${email}, ${expiresAt.toISOString()})
    `;

  // 3) Build magic link
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/api/confirm?token=${token}`;

  // 4) Send email with Resend
  const { data, error } = await resend.emails.send({
  from: process.env.EMAIL_FROM!,
  to: email,
  subject: "Verify your VT Craft email",
  html: `
    <div style="font-family: system-ui, sans-serif">
      <h2>Verify your email</h2>
      <p>Click the link below to verify:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    </div>
  `,
  text: `Verify your VT Craft email by visiting this link:

${verifyUrl}

If you did not request this, you can ignore this email.`,
});

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true});
}
