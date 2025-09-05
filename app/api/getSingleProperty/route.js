import { encryptData } from "@/components/utils/crypto";
import moment from "moment";
export async function GET(req) {
  try {
    const { query } = await import("@/lib/server/db");
    const { searchParams } = new URL(req.url);
    const unique_property_id = searchParams.get("unique_property_id");
    if (!unique_property_id) {
      return new Response(
        JSON.stringify({ error: "unique_property_id is required" }),
        { status: 400 }
      );
    }
    const propertyQuery = `
      SELECT 
        p.*, 
        u.name, u.email, u.mobile, u.photo, u.user_type
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.unique_property_id = ?
      LIMIT 1
    `;
    const propertyResults = await query(propertyQuery, [unique_property_id], {
      timeout: 5000,
    });
    if (propertyResults.length === 0) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
      });
    }
    const row = propertyResults[0];
    const {
      name,
      email,
      mobile,
      photo,
      user_type,
      updated_date,
      updated_time,
      ...property
    } = row;
    const formattedDate = updated_date
      ? moment(updated_date).format("YYYY-MM-DD")
      : null;
    const formattedTime = updated_time
      ? moment(updated_time, "HH:mm:ss").format("HH:mm:ss")
      : null;
    const propertyWithUser = {
      ...property,
      unique_property_id,
      updated_date: formattedDate,
      updated_time: formattedTime,
      user: { name, email, mobile, photo, user_type },
    };
    const aroundPlacesQuery = `
      SELECT * FROM around_this_property
      WHERE unique_property_id = ?
    `;
    const aroundPlacesResults = await query(
      aroundPlacesQuery,
      [unique_property_id],
      { timeout: 5000 }
    );
    propertyWithUser.around_places = aroundPlacesResults || [];
    const encryptedData = encryptData({ property: propertyWithUser });
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");

    headers.set("Vary", "Accept-Encoding");
    return new Response(JSON.stringify(encryptedData), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
