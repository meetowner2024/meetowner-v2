import { NextResponse } from "next/server";
import pool from "@/lib/server/db";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const unique_property_id = searchParams.get("unique_property_id");
    let sql = `
      SELECT unique_property_id, bedrooms, bathroom, sub_type, property_name, rera_approved,
             property_for, property_in, occupancy, facilities, bike_parking,
             car_parking, builtup_area, builtup_unit, carpet_area, city_id, location_id,
             image AS featured_image, property_cost, state_id, unit_cost_type, user_id,
             google_address, furnished_status
      FROM properties
      WHERE property_status = 1
    `;
    const params = [];
    if (unique_property_id) {
      sql += " AND unique_property_id = ?";
      params.push(unique_property_id);
    } else {
      sql +=
        ' AND sub_type = "Apartment" AND property_cost > 10000000 ORDER BY id DESC LIMIT 15';
    }
    const [properties] = await pool.query(sql, params);
    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { message: "No properties found" },
        { status: 404 }
      );
    }
    const propertyIds = properties.map((p) => p.unique_property_id);
    const [imagesRows] = await pool.query(
      `SELECT id, property_id, image, priority FROM properties_gallery WHERE property_id IN (?)`,
      [propertyIds]
    );
    const imagesByProperty = {};
    imagesRows.forEach((img) => {
      if (!imagesByProperty[img.property_id])
        imagesByProperty[img.property_id] = [];
      imagesByProperty[img.property_id].push({
        id: img.id,
        url: `https://api.meetowner.in/aws/v1/s3/uploads/${img.image}`,
        priority: img.priority,
      });
    });
    const results = properties.map((property) => {
      const images = imagesByProperty[property.unique_property_id] || [];
      const featured = images.find((img) => img.priority === 1);
      return {
        ...property,
        images,
        featuredImage: featured ? featured.url : property.featured_image,
      };
    });
    const responseResults = unique_property_id
      ? results
      : results.sort(() => 0.5 - Math.random());
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
    headers.set("Vary", "Accept-Encoding");
    return new NextResponse(JSON.stringify({ results: responseResults }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching properties with images:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
