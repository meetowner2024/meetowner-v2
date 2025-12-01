import { NextResponse } from "next/server";

export async function POST(req) {
  const { query } = await import("@/lib/server/db");

  const data = await req.json();

  const subscription = data.subscription;
  const userId = data.user_id || null;

  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  const userAgent = req.headers.get("user-agent") || "unknown";

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Invalid subscription format" },
      { status: 400 }
    );
  }

  try {
    await query(
      `
      INSERT INTO web_push_subscriptions 
      (user_id, endpoint, p256dh_key, auth_key, user_agent)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        p256dh_key = VALUES(p256dh_key),
        auth_key = VALUES(auth_key),
        user_id = VALUES(user_id),
        user_agent = VALUES(user_agent),
        updated_at = CURRENT_TIMESTAMP
      `,
      [userId, endpoint, p256dh, auth, userAgent]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving subscription:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
