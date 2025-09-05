export async function GET(req) {
  try {
    const { query } = await import("@/lib/server/db");
    const sql = `
      SELECT u.name, COUNT(p.id) AS property_count
      FROM users u
      JOIN properties p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY property_count DESC
      LIMIT 10
    `;
    const results = await query(sql, []);

    if (!results || results.length === 0) {
      return Response.json({ message: "No sellers found" }, { status: 404 });
    }
    const shuffled = results.sort(() => 0.5 - Math.random());
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");

    headers.set("Vary", "Accept-Encoding");
    return new Response(JSON.stringify({ sellers: shuffled }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching recommended sellers:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
