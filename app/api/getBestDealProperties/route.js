import { NextResponse } from "next/server";
export async function GET() {
  try {
    const sql = `SELECT unique_property_id, property_name, builder_name, property_in,
             property_for, sub_type, occupancy, location_id, city_id,google_address,
             facilities, image, bathroom, bedrooms, property_cost,bike_parking,car_parking,monthly_rent, user_id FROM properties WHERE other_info = 'best deal' ORDER BY id DESC`;
    const { query } = await import("@/lib/server/db");
    const results = await query(sql, []);
    if (!results || results.length === 0) {
      return NextResponse.json(
        { message: "No properties found" },
        { status: 404 }
      );
    }
    const shuffled = results.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
    headers.set("Vary", "Accept-Encoding");
    return NextResponse.json({ results: selected }, { status: 200, headers });
  } catch (error) {
    console.error("Error fetching random properties:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
