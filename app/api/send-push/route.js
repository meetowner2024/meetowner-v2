import webpush from "web-push";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { query } = await import("@/lib/server/db");
  const { title, body, url, user_id } = await req.json();

  webpush.setVapidDetails(
    "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  try {
    const rows = user_id
      ? await query(`SELECT * FROM web_push_subscriptions WHERE user_id = ?`, [
          user_id,
        ])
      : await query(`SELECT * FROM web_push_subscriptions`);

    // If query() returns "null" or "undefined"
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "No subscribers found." });
    }

    for (const sub of rows) {
      const subscriptionObject = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      };

      try {
        await webpush.sendNotification(
          subscriptionObject,
          JSON.stringify({ title, body, url })
        );
      } catch (err) {
        console.error("Push send failed:", err);

        // Remove expired/invalid subscription
        if (err.statusCode === 410 || err.statusCode === 404) {
          await query(`DELETE FROM web_push_subscriptions WHERE endpoint = ?`, [
            sub.endpoint,
          ]);
          console.log("Deleted expired subscription:", sub.endpoint);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending push:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
