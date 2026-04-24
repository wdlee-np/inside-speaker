import { NextRequest, NextResponse } from "next/server";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const {
    company, department, name, email, phone,
    eventDate, budget, topic, audience, message, speakerId,
  } = body as Record<string, string | undefined>;

  if (!company || !name || !email) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  const parts = [
    topic    ? `희망 주제: ${topic}` : null,
    audience ? `예상 인원: ${audience}` : null,
    message  || null,
  ].filter(Boolean);
  const fullMessage = parts.length > 0 ? parts.join("\n") : null;

  if (isDev()) return NextResponse.json({ ok: true });

  const { createClient } = await import("@/lib/supabase/server");
  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("inquiries").insert({
    company,
    department: department || null,
    contact_name: name,
    email,
    phone: phone || "",
    desired_speaker: speakerId || null,
    desired_date: eventDate || null,
    budget_range: budget || null,
    message: fullMessage,
    status: "new",
    source_url: req.headers.get("referer") || null,
    ip_address: req.headers.get("x-forwarded-for") || null,
    user_agent: req.headers.get("user-agent") || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const resendKey = process.env.RESEND_API_KEY ?? "";
  if (resendKey && !resendKey.includes("placeholder")) {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    const to = process.env.NOTIFICATION_EMAIL ?? "contact@insidecompany.co.kr";

    await resend.emails.send({
      from: "Inside Speakers <noreply@insidecompany.co.kr>",
      to,
      subject: `[섭외 문의] ${company} · ${name}`,
      html: [
        `<h2>새 섭외 문의가 접수되었습니다.</h2>`,
        `<table style="border-collapse:collapse">`,
        row("기업명", company),
        row("부서", department || "-"),
        row("담당자", name),
        row("이메일", email),
        row("연락처", phone || "-"),
        row("희망 일정", eventDate || "-"),
        row("예산 구간", budget || "-"),
        row("희망 연사 ID", speakerId || "-"),
        `<tr><td style="padding:6px 12px;border:1px solid #eee;font-weight:600">메시지</td>`,
        `<td style="padding:6px 12px;border:1px solid #eee;white-space:pre-wrap">${fullMessage ?? "-"}</td></tr>`,
        `</table>`,
      ].join(""),
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 12px;border:1px solid #eee;font-weight:600">${label}</td><td style="padding:6px 12px;border:1px solid #eee">${value}</td></tr>`;
}
