export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ads_page = (searchParams.get("ads_page") || "").trim().toLowerCase();
    const city = (searchParams.get("city") || "").trim().toLowerCase();
    let sql = `
      SELECT id, ads_page, city, ads_order, image, unique_property_id
      FROM ads_details
    `;
    const conditions = [];
    const params = [];
    if (ads_page && ads_page !== "all_ads") {
      conditions.push("LOWER(ads_page) = ?");
      params.push(ads_page);
    }
    if (city) {
      conditions.push("LOWER(city) = ?");
      params.push(city);
    }
    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    const { query } = await import("@/lib/server/db");
    sql += " ORDER BY ads_order ASC";
    const adsResults = await query(sql, params, { timeout: 10000 });
    const enrichedAds = await Promise.all(
      adsResults.map(async (ad) => {
        if (!ad.unique_property_id) {
          return { ...ad, property_data: null };
        }
        try {
          const propertyQuery = `
            SELECT id, property_name, property_type, property_for, address, property_cost, image
            FROM properties
            WHERE unique_property_id = ?
          `;
          const propResults = await query(
            propertyQuery,
            [ad.unique_property_id],
            { timeout: 5000 }
          );
          return { ...ad, property_data: propResults[0] || null };
        } catch (error) {
          console.error(`Error fetching property for ad_id ${ad.id}:`, error);
          return { ...ad, property_data: null };
        }
      })
    );
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
    headers.set("Vary", "Accept-Encoding");
    return new Response(
      JSON.stringify({
        message: "Ads with selected property data fetched successfully",
        ads: enrichedAds,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching ads", details: error.message }),
      { status: 500 }
    );
  }
}
