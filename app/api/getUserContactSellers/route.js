import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const sql = `
      SELECT * 
      FROM contact_seller 
      WHERE user_id = ? 
      ORDER BY id DESC
    `;
    const { query } = await import("@/lib/server/db");
    const results = await query(sql, [user_id]);

    if (!results || results.length === 0) {
      return NextResponse.json(
        { message: "No data found", data: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contact sellers for user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
