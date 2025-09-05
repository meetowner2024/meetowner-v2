import { NextResponse } from "next/server";
export async function GET() {
  try {
    const sql = `
     SELECT *
FROM properties
WHERE property_status = 1
  AND sub_type = "Apartment"
  AND property_cost > 10000000
ORDER BY id DESC
LIMIT 100
    `;
    const { query } = await import("@/lib/server/db");
    const results = await query(sql, []);
    if (!results || results.length === 0) {
      return NextResponse.json(
        { message: "No properties found" },
        { status: 404 }
      );
    }
    const shuffled = results.sort(() => 0.5 - Math.random());
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
    headers.set("Vary", "Accept-Encoding");
    return new NextResponse(JSON.stringify({ results: shuffled }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching random properties:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
