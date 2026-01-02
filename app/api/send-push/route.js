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
    const queryStr = user_id
      ? "SELECT endpoint, p256dh_key, auth_key FROM web_push_subscriptions WHERE user_id = ?"
      : "SELECT endpoint, p256dh_key, auth_key FROM web_push_subscriptions";

    const rows = user_id ? await query(queryStr, [user_id]) : await query(queryStr);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "No subscribers found." });
    }

    const payload = JSON.stringify({ title, body, url });

    const notifications = rows.map(async (sub) => {
      const subscriptionObject = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      };

      try {
        await webpush.sendNotification(subscriptionObject, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await query(`DELETE FROM web_push_subscriptions WHERE endpoint = ?`, [
            sub.endpoint,
          ]);
        }
        throw err; // Propagate error for Promise.allSettled stats if needed
      }
    });

    await Promise.allSettled(notifications);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending push:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
