import moment from "moment";
function getFirstName(propertyName) {
  if (!propertyName || typeof propertyName !== "string") return "";
  return propertyName.trim().split(" ")[0].toLowerCase();
}
function checkConsecutiveFirstNames(properties) {
  let hasConsecutive = false;
  for (let i = 0; i < properties.length - 1; i++) {
    const currentFirst = getFirstName(properties[i].property_name);
    const nextFirst = getFirstName(properties[i + 1].property_name);
    if (currentFirst && currentFirst === nextFirst) {
      hasConsecutive = true;
    }
  }
  return hasConsecutive;
}
function shuffleProperties(properties, batchSize = 5) {
  if (properties.length <= 1) return properties;
  const firstNameMap = new Map();
  for (const prop of properties) {
    const firstName = getFirstName(prop.property_name);
    if (!firstNameMap.has(firstName)) {
      firstNameMap.set(firstName, []);
    }
    firstNameMap.get(firstName).push(prop);
  }
  if (firstNameMap.size === 1) {
    return properties;
  }
  const result = [];
  let availableNames = Array.from(firstNameMap.keys());
  while (result.length < properties.length && availableNames.length > 0) {
    const batch = [];
    const usedNames = new Set();
    for (const name of availableNames) {
      if (batch.length >= batchSize) break;
      const props = firstNameMap.get(name);
      if (props.length > 0) {
        const prop = props.shift();
        batch.push(prop);
        usedNames.add(name);
      }
    }
    for (let i = batch.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [batch[i], batch[j]] = [batch[j], batch[i]];
    }
    if (result.length > 0 && batch.length > 0) {
      const lastFirst = getFirstName(result[result.length - 1].property_name);
      const nextFirst = getFirstName(batch[0].property_name);
      if (lastFirst === nextFirst) {
        batch.push(batch.shift());
      }
    }
    result.push(...batch);
    for (const name of usedNames) {
      if (firstNameMap.get(name).length === 0) {
        firstNameMap.delete(name);
      }
    }
    availableNames = Array.from(firstNameMap.keys());
  }
  checkConsecutiveFirstNames(result);
  return result;
}
export async function GET() {
  try {
    const { query } = await import("@/lib/server/db");
    const readyQuery = `
      SELECT unique_property_id, property_name, builder_name, property_in,
             property_for, sub_type, occupancy, location_id, city_id,
             facilities, image, bathroom, bedrooms, property_cost, user_id
      FROM properties
      WHERE property_status = 1
        AND occupancy = "Ready to move"
      ORDER BY id DESC
      LIMIT 15
    `;
    const readyRaw = await query(readyQuery);
    const finalReady = shuffleProperties(readyRaw).slice(0, 10);
    const underQuery = `
      SELECT unique_property_id, property_name, builder_name, property_in,
             property_for, sub_type, occupancy, location_id, city_id,
             facilities, image, bathroom, bedrooms, property_cost, user_id
      FROM properties
      WHERE property_status = 1
        AND occupancy = "Under Construction"
      ORDER BY id DESC
      LIMIT 15
    `;
    const underRaw = await query(underQuery);
    const finalUnder = shuffleProperties(underRaw).slice(0, 10);
    return Response.json(
      {
        ready_to_move: {
          count: finalReady.length,
          properties: finalReady,
        },
        under_construction: {
          count: finalUnder.length,
          properties: finalUnder,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );
  } catch (err) {
    console.error("API ERROR:", err);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
