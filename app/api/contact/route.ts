import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, phone, service, message } = body;

    // バリデーション
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "必須項目が入力されていません。" },
        { status: 400 }
      );
    }

    // メール送信
    const { error } = await resend.emails.send({
      from: "NovolBa お問い合わせ <onboarding@resend.dev>",
      to: ["support@novolba.com"],
      replyTo: email,
      subject: `【お問い合わせ】${name}様より`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #3dbdac; border-bottom: 2px solid #3dbdac; padding-bottom: 8px;">
            NovolBa お問い合わせ
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; width: 140px; border: 1px solid #e5e7eb;">お名前</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">会社名</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${company || "未入力"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">メールアドレス</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">電話番号</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${phone || "未入力"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">ご興味のサービス</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${service || "未選択"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; border: 1px solid #e5e7eb;">お問い合わせ内容</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>

          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
            このメールはNovolBaウェブサイトのお問い合わせフォームから送信されました。
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "メールの送信に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
