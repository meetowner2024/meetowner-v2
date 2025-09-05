import moment from "moment";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const property_for = searchParams.get("property_for");
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    const { query } = await import("@/lib/server/db");
    const getFirstWord = (name) => name?.split(" ")[0]?.toLowerCase() || "";
    const eightDaysAgo = moment()
      .subtract(8, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    let newPropertiesQuery = `
      SELECT * FROM properties 
      WHERE property_status = 1 
        AND sub_type != "PLOT" 
        AND updated_date >= ?
    `;
    let queryParams = [eightDaysAgo];
    if (property_for) {
      newPropertiesQuery += ` AND property_for = ?`;
      queryParams.push(property_for);
    }
    if (property_for !== "Rent") {
      newPropertiesQuery += ` AND sub_type = "Apartment"`;
    }
    newPropertiesQuery += ` ORDER BY id DESC`;
    const newResults = await query(newPropertiesQuery, queryParams);
    let uniqueNewProperties = [];
    if (newResults.length > 0) {
      const shuffledNewProperties = shuffleArray([...newResults]);
      const seenFirstWords = new Set();
      for (const property of shuffledNewProperties) {
        const firstWord = getFirstWord(property.property_name);
        if (!seenFirstWords.has(firstWord)) {
          seenFirstWords.add(firstWord);
          uniqueNewProperties.push(property);
        }
        if (uniqueNewProperties.length >= 15) break;
      }
    }
    if (uniqueNewProperties.length >= 10) {
      const finalProperties = shuffleArray(uniqueNewProperties.slice(0, 10));
      return Response.json({
        count: finalProperties.length,
        properties: finalProperties,
      });
    }
    const remainingCount = 10 - uniqueNewProperties.length;
    let topPropertiesQuery = `
      SELECT * FROM properties 
      WHERE property_status = 1 
        AND sub_type != "PLOT"
    `;
    let topQueryParams = [];
    if (property_for) {
      topPropertiesQuery += ` AND property_for = ?`;
      topQueryParams.push(property_for);
    }
    if (property_for !== "Rent") {
      topPropertiesQuery += ` AND sub_type = "Apartment"`;
    }
    if (uniqueNewProperties.length > 0) {
      const selectedIds = uniqueNewProperties.map((p) => p.id);
      topPropertiesQuery += ` AND id NOT IN (${selectedIds
        .map(() => "?")
        .join(",")})`;
      topQueryParams.push(...selectedIds);
    }
    topPropertiesQuery += ` ORDER BY id DESC LIMIT ?`;
    topQueryParams.push(remainingCount + 5);
    const topResults = await query(topPropertiesQuery, topQueryParams);
    let uniqueTopProperties = [];
    if (topResults.length > 0) {
      const shuffledTopProperties = shuffleArray([...topResults]);
      const seenFirstWords = new Set(
        uniqueNewProperties.map((p) => getFirstWord(p.property_name))
      );
      for (const property of shuffledTopProperties) {
        const firstWord = getFirstWord(property.property_name);
        if (!seenFirstWords.has(firstWord)) {
          seenFirstWords.add(firstWord);
          uniqueTopProperties.push(property);
        }
        if (uniqueTopProperties.length >= remainingCount) break;
      }
    }
    const combinedProperties = [
      ...uniqueNewProperties,
      ...uniqueTopProperties,
    ].slice(0, 10);
    if (combinedProperties.length < 10) {
      const stillNeeded = 10 - combinedProperties.length;
      let fallbackQuery = `
        SELECT * FROM properties 
        WHERE property_status = 1 
          AND sub_type != "PLOT"
      `;
      let fallbackParams = [];
      if (property_for) {
        fallbackQuery += ` AND property_for = ?`;
        fallbackParams.push(property_for);
      }
      const allSelectedIds = combinedProperties.map((p) => p.id);
      if (allSelectedIds.length > 0) {
        fallbackQuery += ` AND id NOT IN (${allSelectedIds
          .map(() => "?")
          .join(",")})`;
        fallbackParams.push(...allSelectedIds);
      }
      fallbackQuery += ` ORDER BY id DESC LIMIT ?`;
      fallbackParams.push(stillNeeded);
      const fallbackResults = await query(fallbackQuery, fallbackParams);
      const finalProperties = shuffleArray([
        ...combinedProperties,
        ...fallbackResults.slice(0, stillNeeded),
      ]);
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      headers.set("Cache-Control", "public, max-age=60, s-maxage=60");

      headers.set("Vary", "Accept-Encoding");
      return Response.json(
        {
          count: finalProperties.length,
          properties: finalProperties,
        },
        {
          status: 200,
          headers,
        }
      );
    }
    const finalProperties = shuffleArray(combinedProperties);
    return new Response(
      JSON.stringify({
        count: finalProperties.length,
        properties: finalProperties,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
