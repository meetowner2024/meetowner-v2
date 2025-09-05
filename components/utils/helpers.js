// components/utils/helpers.js
export function shuffleProperties(properties, batchSize = 5) {
  if (properties.length <= 1) {
    return properties;
  }
  const firstNameMap = new Map();
  for (const prop of properties) {
    const firstName = getFirstName(prop.property_name);
    if (!firstNameMap.has(firstName)) {
      firstNameMap.set(firstName, []);
    }
    firstNameMap.get(firstName).push(prop);
  }
  if (firstNameMap.size === 1) {
    console.warn(
      "All properties have the same first name. Cannot shuffle to avoid consecutive first names."
    );
    return properties;
  }
  const result = [];
  let availableFirstNames = Array.from(firstNameMap.keys());
  while (result.length < properties.length && availableFirstNames.length > 0) {
    const batch = [];
    const usedFirstNames = new Set();
    for (const firstName of availableFirstNames) {
      if (batch.length >= batchSize) break;
      const props = firstNameMap.get(firstName);
      if (props.length > 0) {
        const prop = props.shift();
        batch.push(prop);
        usedFirstNames.add(firstName);
      }
    }
    for (let i = batch.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [batch[i], batch[j]] = [batch[j], batch[i]];
    }
    if (result.length > 0 && batch.length > 0) {
      const lastFirstName = getFirstName(
        result[result.length - 1].property_name
      );
      const firstBatchFirstName = getFirstName(batch[0].property_name);
      if (lastFirstName === firstBatchFirstName) {
        batch.push(batch.shift());
      }
    }
    result.push(...batch);
    for (const firstName of usedFirstNames) {
      if (firstNameMap.get(firstName).length === 0) {
        firstNameMap.delete(firstName);
      }
    }
    availableFirstNames = Array.from(firstNameMap.keys());
  }
  checkConsecutiveFirstNames(result);
  return result;
}

export function getFirstName(propertyName) {
  if (!propertyName || typeof propertyName !== "string") return "";
  return propertyName.trim().split(" ")[0].toLowerCase();
}

export function checkConsecutiveFirstNames(properties) {
  let hasConsecutive = false;
  for (let i = 0; i < properties.length - 1; i++) {
    const currentFirstName = getFirstName(properties[i].property_name);
    const nextFirstName = getFirstName(properties[i + 1].property_name);
    if (currentFirstName && currentFirstName === nextFirstName) {
      hasConsecutive = true;
    }
  }
  if (hasConsecutive) {
    console.warn("Consecutive properties with same first name detected.");
  }
  return hasConsecutive;
}
