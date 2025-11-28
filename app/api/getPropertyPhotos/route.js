import { NextResponse } from "next/server";
import pool from "@/lib/server/db";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const unique_property_id = searchParams.get("unique_property_id");
    if (!unique_property_id) {
      return NextResponse.json(
        { status: "error", message: "unique_property_id is required" },
        { status: 400 }
      );
    }
    const [property_images] = await pool.query(
      `SELECT id, property_id, image, priority 
       FROM properties_gallery 
       WHERE property_id = ?`,
      [unique_property_id]
    );
    if (!property_images || property_images.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Property not found" },
        { status: 404 }
      );
    }
    const images = property_images.map((img) => ({
      id: img.id,
      url: `https://api.meetowner.in/aws/v1/s3/uploads/${img.image}`,
    }));
    const featured = property_images.find((img) => img.priority === 1);
    const featuredIndex = property_images.findIndex(
      (img) => img.priority === 1
    );
    const responseData = {
      status: "success",
      message: "Property images fetched successfully",
      images,
      featuredImage: featured
        ? `https://api.meetowner.in/aws/v1/s3/uploads/${featured.image}`
        : null,
      featuredImageIndex: featuredIndex,
    };
    const response = NextResponse.json(responseData);
    response.headers.set("Cache-Control", "public, max-age=120, s-maxage=300");
    response.headers.set(
      "ETag",
      `"${unique_property_id}-${property_images.length}"`
    );
    response.headers.set("Vary", "Accept-Encoding");
    return response;
  } catch (error) {
    console.error("Error in getPropertyPhotos:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
