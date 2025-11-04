import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const getCacheKey = (queryStr) => {
  return Buffer.from(queryStr.toLowerCase().trim()).toString("base64");
};
const parseAmountToNumber = (text) => {
  if (!text) return null;
  const cleaned = text.toLowerCase().replace(/[,\s]+/g, "");
  const lakhMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(l|lac|lakh|lakhs)/);
  const crMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(cr|crore|crores)/);
  const kMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(k|thousand)/);
  const plain = cleaned.match(/\b(\d{5,9})\b/);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  if (plain) return parseInt(plain[1]);
  return null;
};
const extractQuery = (q, locations) => {
  const queryStr = (q || "").toLowerCase();
  let bedrooms = null;
  const bhkMatch = queryStr.match(/(\d+)(?:\s*-?\s*)?(bhk|bedrooms)/i);
  if (bhkMatch) {
    bedrooms = parseInt(bhkMatch[1]);
  } else {
    const numMatch = queryStr.match(/^(\d+)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1]);
      if (num >= 1 && num <= 6) {
        bedrooms = num;
      }
    }
  }
  const forRent = /(rent|rental)/.test(queryStr);
  const forSell = /(buy|sale|sell|purchase)/.test(queryStr);
  const propertyFor = forRent ? "Rent" : forSell ? "Sell" : null;
  const typeWords = [
    "apartment",
    "apartments",
    "flats",
    "flat",
    "villa",
    "villas",
    "independent villa",
    "plot",
    "plots",
    "office",
    "independent",
    "independent house",
    "commercial",
    "residential",
  ];
  const type = typeWords.find((t) => queryStr.includes(t));
  const amenityWords = [
    "swimming pool",
    "pool",
    "gym",
    "park",
    "garden",
    "power backup",
    "lift",
    "cctv",
    "club house",
    "sports",
    "gated community",
    "parking",
  ];
  const amenities = amenityWords.filter((a) => queryStr.includes(a));
  const maxMatch = queryStr.match(
    /(under|below|upto|up\s*to|less\s*than)\s*([^,]+)/
  );
  const minMatch = queryStr.match(
    /(above|over|more\s*than|minimum|at\s*least)\s*([^,]+)/
  );
  const betweenMatch = queryStr.match(
    /between\s*([^,]+)\s*(and|to|-)\s*([^,]+)/
  );
  let maxBudget = null;
  let minBudget = null;
  if (betweenMatch) {
    minBudget = parseAmountToNumber(betweenMatch[1]);
    maxBudget = parseAmountToNumber(betweenMatch[3]);
  } else {
    if (maxMatch) maxBudget = parseAmountToNumber(maxMatch[2]);
    if (minMatch) minBudget = parseAmountToNumber(minMatch[2]);
  }
  const location =
    locations.find((c) => c && queryStr.includes(c.toLowerCase())) || null;
  const floorMatch = queryStr.match(/(\d+)(st|nd|rd|th)?\s*floor/);
  const floors = floorMatch ? parseInt(floorMatch[1]) : null;
  let occupancy = null;
  if (queryStr.includes("under construction")) {
    occupancy = "Under Construction";
  } else if (queryStr.includes("ready to move")) {
    occupancy = "Ready to move";
  }
  const isLuxury = queryStr.includes("luxury");
  const isBudget = queryStr.includes("budget");
  return {
    bedrooms,
    propertyFor,
    type,
    minBudget,
    maxBudget,
    location,
    amenities,
    floors,
    occupancy,
    isLuxury,
    isBudget,
  };
};
const humanize = (q, locations) => {
  const extracted = extractQuery(q, locations);
  const {
    bedrooms,
    propertyFor,
    type,
    minBudget,
    maxBudget,
    location,
    amenities,
    floors,
    occupancy,
    isLuxury,
    isBudget,
  } = extracted;
  const parts = [];
  if (type) parts.push(type + (bedrooms ? ` ${bedrooms} bhk` : ""));
  else if (bedrooms) parts.push(`${bedrooms} bhk`);
  if (floors) parts.push(`${floors}th floor`);
  if (occupancy) parts.push(occupancy.toLowerCase());
  if (isLuxury) parts.push("luxury");
  if (isBudget) parts.push("budget");
  if (amenities?.length) parts.push(amenities.join(" and "));
  if (location) parts.push(`near ${location}`);
  if (minBudget && maxBudget)
    parts.push(
      `between ₹${minBudget.toLocaleString()} and ₹${maxBudget.toLocaleString()}`
    );
  else if (maxBudget) parts.push(`under ₹${maxBudget.toLocaleString()}`);
  else if (minBudget) parts.push(`above ₹${minBudget.toLocaleString()}`);
  if (propertyFor) parts.push(`for ${propertyFor.toLowerCase()}`);
  if (!parts.length) return q;
  return parts.join(", ");
};
const detectCasualIntent = (q) => {
  const s = q.toLowerCase().trim();
  if (/^(hi|hello|hey|yo|hii|hiii)(\b|!|\.)/.test(s)) return "greeting";
  if (/(how\s*are\s*you|how are u|how r u)/.test(s)) return "howareyou";
  if (/(thank\s*you|thanks|tysm|thx)/.test(s)) return "thanks";
  if (/(bye|goodbye|see\s*you|cya|see ya)/.test(s)) return "bye";
  if (/(help|what\s*can\s*you\s*do|who\s*are\s*you)/.test(s)) return "help";
  return "none";
};
const isPropertyIntent = (q, locations) => {
  const s = q.toLowerCase();
  if (/(\d+)(?:\s*-?\s*)?(bhk|bedrooms)/i.test(s)) return true;
  if (/^\d+$/.test(s)) {
    const num = parseInt(s);
    if (num >= 1 && num <= 6) return true;
  }
  if (
    /(apartment|flat|villa|plot|office|independent|commercial|residential|house)/.test(
      s
    )
  )
    return true;
  if (/(rent|rental|buy|sale|sell|purchase)/.test(s)) return true;
  if (/(lakh|lakhs|lac|cr|crore|k|thousand|under|above|between)/.test(s))
    return true;
  if (/(\d+)(st|nd|rd|th)?\s*floor/.test(s)) return true;
  if (/(under\s*construction|ready\s*to\s*move)/.test(s)) return true;
  if (/(luxury|budget)/.test(s)) return true;
  const locationHit = locations.some(
    (c) => c && s.includes(String(c).toLowerCase())
  );
  return locationHit;
};
let cachedLocations = null;
const getLocations = async () => {
  if (cachedLocations) return cachedLocations;
  const locationsQuery = `
    SELECT DISTINCT city_id as loc FROM properties WHERE city_id IS NOT NULL AND city_id != ''
    UNION 
    SELECT DISTINCT location_id as loc FROM properties WHERE location_id IS NOT NULL AND location_id != ''
  `;
  const results = await query(locationsQuery, []);
  cachedLocations = results.map((r) => String(r.loc).trim()).filter(Boolean);
  return cachedLocations;
};
const filterAndRankFromDB = async (extracted, q, limit = 6) => {
  const {
    bedrooms,
    propertyFor,
    type,
    minBudget,
    maxBudget,
    location,
    amenities,
    floors,
    occupancy,
    isLuxury,
    isBudget,
  } = extracted;
  let sql = `
    SELECT * FROM properties 
    WHERE property_status = 1 
  `;
  const params = [];
  if (type !== "plot" && !q.toLowerCase().includes("plot")) {
    sql += ` AND sub_type != "PLOT"`;
  }
  if (propertyFor) {
    sql += ` AND property_for = ?`;
    params.push(propertyFor);
  }
  if (type) {
    const typeMap = {
      apartment: "Apartment",
      flat: "Apartment",
      villa: "Villa",
      "independent villa": "Villa",
      plot: "Plot",
      plots: "Plot",
      office: "Office",
      independent: "Independent House",
      "independent house": "Independent House",
      commercial: "Commercial",
      residential: "Apartment",
      house: "Independent House",
    };
    const subType = typeMap[type] || type;
    sql += ` AND sub_type LIKE ?`;
    params.push(`%${subType}%`);
  }
  if (bedrooms !== null) {
    sql += ` AND bedrooms = ?`;
    params.push(bedrooms);
  }
  if (location) {
    sql += ` AND (LOWER(city_id) LIKE ? OR LOWER(location_id) LIKE ? OR LOWER(google_address) LIKE ?)`;
    const locationLower = `%${location.toLowerCase()}%`;
    params.push(locationLower, locationLower, locationLower);
  }
  if (floors !== null) {
    sql += ` AND LOWER(floors) LIKE ?`;
    params.push(`%${floors}%`);
  }
  if (occupancy) {
    sql += ` AND occupancy = ?`;
    params.push(occupancy);
  }
  if (propertyFor === "Rent") {
    if (minBudget !== null) {
      sql += ` AND monthly_rent >= ?`;
      params.push(minBudget);
    }
    if (maxBudget !== null) {
      sql += ` AND monthly_rent <= ?`;
      params.push(maxBudget);
    }
  } else {
    if (minBudget !== null) {
      sql += ` AND property_cost >= ?`;
      params.push(minBudget);
    }
    if (maxBudget !== null) {
      sql += ` AND property_cost <= ?`;
      params.push(maxBudget);
    }
  }
  if (isLuxury) {
    sql += ` AND property_cost > 10000000`;
  }
  if (isBudget) {
    sql += ` AND property_cost < 5000000`;
  }
  if (amenities && amenities.length > 0) {
    const amenityConditions = amenities
      .map(() => `LOWER(facilities) LIKE ?`)
      .join(" OR ");
    sql += ` AND (${amenityConditions})`;
    amenities.forEach((amenity) => {
      params.push(`%${amenity.toLowerCase()}%`);
    });
  }
  let searchClause = "";
  const searchValues = [];
  if (q) {
    const searchLower = `%${q.toLowerCase()}%`;
    searchClause = `
      AND (
        LOWER(unique_property_id) LIKE ? OR
        LOWER(property_name) LIKE ? OR
        LOWER(builder_name) LIKE ? OR
        LOWER(google_address) LIKE ? OR
        LOWER(location_id) LIKE ?
      )
    `;
    searchValues.push(
      searchLower,
      searchLower,
      searchLower,
      searchLower,
      searchLower
    );
  }
  sql += searchClause;
  sql += `
    ORDER BY updated_date DESC, id DESC
    LIMIT ?
  `;
  params.push(...searchValues);
  params.push(limit * 3);
  const results = await query(sql, params);
  let scored = results
    .map((p) => {
      let score = 0;
      const pCity = String(p?.city_id || "").toLowerCase();
      const pLoc = String(
        p?.location_id || p?.google_address || ""
      ).toLowerCase();
      const subtype = String(p?.sub_type || "").toLowerCase();
      const forVal = String(p?.property_for || "").toLowerCase();
      const price = Number(p?.property_cost) || Number(p?.monthly_rent);
      const queryLower = q.toLowerCase();
      if (
        location &&
        (pCity.includes(location.toLowerCase()) ||
          pLoc.includes(location.toLowerCase()))
      )
        score += 5;
      if (bedrooms && String(p?.bedrooms) === String(bedrooms)) score += 4;
      if (
        floors &&
        String(p?.floors || "")
          .toLowerCase()
          .includes(String(floors))
      )
        score += 4;
      if (type && subtype.includes(type)) score += 3;
      if (occupancy && p?.occupancy === occupancy) score += 3;
      if (propertyFor && forVal === propertyFor.toLowerCase()) score += 3;
      if (minBudget && price && price >= minBudget) score += 2;
      if (maxBudget && price && price <= maxBudget) score += 2;
      if (amenities?.length && p?.facilities) {
        const pAmenities = String(p.facilities).toLowerCase();
        const hits = amenities.reduce(
          (acc, a) => (pAmenities.includes(a) ? acc + 1 : acc),
          0
        );
        score += Math.min(3, hits);
      }
      if (p?.builder_name && p.builder_name.toLowerCase().includes(queryLower))
        score += 4;
      if (
        p?.property_name &&
        p.property_name.toLowerCase().includes(queryLower)
      )
        score += 4;
      if (
        p.updated_date &&
        new Date(p.updated_date) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ) {
        score += 2;
      }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
  if (scored.length === 0 && q) {
    const fallbackSql = `
      SELECT * FROM properties 
      WHERE property_status = 1 
        AND LOWER(property_name) LIKE ? 
        OR LOWER(builder_name) LIKE ? 
        OR LOWER(sub_type) LIKE ? 
        OR LOWER(location_id) LIKE ? 
      ORDER BY updated_date DESC, id DESC 
      LIMIT ?
    `;
    const fallbackParams = [
      `%${q.toLowerCase()}%`,
      `%${q.toLowerCase()}%`,
      `%${q.toLowerCase()}%`,
      `%${q.toLowerCase()}%`,
      limit,
    ];
    const fallbackResults = await query(fallbackSql, fallbackParams);
    scored = fallbackResults.slice(0, limit);
  }
  return scored;
};
const generateResponse = (q, results, intent, userName) => {
  let reply = "";
  if (results.length) {
    reply = `Hi${
      userName ? ` ${userName}` : ""
    }! I found some options related to "${intent}". Here are a few you might like:`;
  } else {
    reply = `Hey${
      userName ? ` ${userName}` : ""
    }, I couldn’t find exact results for "${intent}". You can try searching with details like BHK type, location, budget, or amenities for better results.`;
  }
  return {
    role: "assistant",
    text: reply,
    suggestions: results,
    userName: userName || null,
  };
};
export async function POST(req) {
  try {
    const { query: userQuery, userName } = await req.json();
    if (!userQuery || typeof userQuery !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    const cacheKey = getCacheKey(userQuery);
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
      });
    }
    const locations = await getLocations();
    const casual = detectCasualIntent(userQuery);
    let responseData;
    if (casual !== "none") {
      let reply = "";
      if (casual === "greeting") {
        reply = userName
          ? `Hello ${userName}, how can I help you today?`
          : "Hello! How can I help you today?";
      } else if (casual === "howareyou") {
        reply = userName
          ? `I'm great, ${userName}! How can I assist with your property search?`
          : "I'm great! How can I assist with your property search?";
      } else if (casual === "thanks") {
        reply = userName
          ? `You're welcome, ${userName}! If you need anything else, just ask.`
          : "You're welcome! If you need anything else, just ask.";
      } else if (casual === "bye") {
        reply = userName
          ? `Bye ${userName}! Have a great day.`
          : "Bye! Have a great day.";
      } else if (casual === "help") {
        reply = userName
          ? `I can help you find properties, ${userName}. Try: "2 BHK apartment in Hitech City under 1 Cr with pool"`
          : 'I can help you find properties. Try: "2 BHK apartment in Hitech City under 1 Cr with pool"';
      } else {
        reply = userName
          ? `Got it, ${userName}. Ask me about locations, budgets, BHK, or amenities!`
          : "Got it. Ask me about locations, budgets, BHK, or amenities!";
      }
      responseData = {
        role: "assistant",
        text: reply,
        suggestions: [],
      };
    } else {
      const extracted = extractQuery(userQuery, locations);
      const results = await filterAndRankFromDB(extracted, userQuery);
      const intent = humanize(userQuery, locations);
      responseData = generateResponse(userQuery, results, intent, userName);
    }
    queryCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
    return NextResponse.json(responseData, { status: 200, headers });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
