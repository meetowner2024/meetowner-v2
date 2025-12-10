export async function GET(req) {
  try {
    const sql = `
      SELECT unique_property_id, property_name, builder_name, property_in,
             property_for, sub_type, occupancy, location_id, city_id,google_address,
             facilities, image, bathroom, bedrooms, property_cost,bike_parking,car_parking,monthly_rent, user_id 
      FROM properties 
      WHERE other_info = 'best deal' OR other_info = 'best meetowner' 
      ORDER BY id DESC
    `;
    const { query } = await import("@/lib/server/db");
    const results = await query(sql, []);
    if (!results || results.length === 0) {
      return Response.json({ message: "No properties found" }, { status: 404 });
    }
    const shuffled = results.sort(() => 0.5 - Math.random());
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");

    headers.set("Vary", "Accept-Encoding");
    return new Response(JSON.stringify({ results: shuffled }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching random properties:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
