import ListingsPageClient from "./ListingsPageClient";

export async function generateMetadata({ searchParams }) {
  const paramsObj = await searchParams;
  const params = {};

  for (const key in paramsObj) {
    const [paramKey, paramValue] = key.split("-");
    if (paramKey && paramValue) {
      params[paramKey] = decodeURIComponent(paramValue.replace(/\+/g, " "));
    }
  }

  const city = params.city || "Hyderabad";
  const location = params.location || "";
  const propertyFor = params.property_for || "Sell";
  const tab = params.tab || "";
  const propertyIn =
    params.property_in === "Residential or Commercial" ||
    !["Residential", "Commercial", "Plot"].includes(params.property_in)
      ? "Residential"
      : params.property_in;
  const subType = params.sub_type || "";
  const bhk = params.bhk || "";

  let propertyStatus = propertyFor.toLowerCase() === "rent" ? "for Rent" : "for Sale";
  if (tab) {
    if (tab.toLowerCase() === "rent") propertyStatus = "for Rent";
    else if (tab.toLowerCase() === "buy") propertyStatus = "for Sale";
  }

  const propertyTypeParts = [];
  if (bhk) propertyTypeParts.push(`${bhk} BHK`);
  if (subType) propertyTypeParts.push(subType);
  if (propertyIn.toLowerCase() !== "other" && propertyIn.toLowerCase() !== "others") {
    propertyTypeParts.push(propertyIn);
  }
  const propertyTypeStr = propertyTypeParts.join(" ");

  const locationStr = location ? `${location}, ${city}` : city;
  const pageTitle = `${propertyTypeStr} in ${locationStr} ${propertyStatus}`;
  const pageDescription = `Explore ${propertyTypeStr} in ${locationStr} ${propertyStatus}. Find the best listings for your dream home or investment property with updated prices and details.`;

  const keywords = [
    `${propertyTypeStr} in ${locationStr}`,
    `${propertyTypeStr} ${propertyStatus}`,
    `${propertyIn} properties in ${city}`,
    `real estate ${city}`,
    location ? `${propertyTypeStr} in ${location}, ${city}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const normalizedParams = {
    ...params,
    property_in: propertyIn,
  };
  const queryString = new URLSearchParams(
    Object.entries(normalizedParams).map(([key, value]) => [`${key}-${value}`, ""])
  ).toString();

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    robots: "index, follow",
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://www.meetowner.in/listings?${queryString}`,
      type: "website",
      siteName: "Meet Owner",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    alternates: {
      canonical: `https://www.meetowner.in/listings?${queryString}`,
    },
  };
}
export default function Page() {
  return <ListingsPageClient />;
}