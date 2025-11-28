import crypto from "crypto";
import config from "../../../components/utils/config";
import PropertyClient from "../PropertyClient";
function buildSeoContent(property, id) {
  const slugify = (value) =>
    value
      ?.toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const bhk = property.bedrooms ? `${property.bedrooms} BHK` : "";
  const subType = property.sub_type || "";
  const propertyName = property.property_name || "";
  const builderName = property.builder_name
    ? `by ${property.builder_name}`
    : "";
  const propertyForText =
    property.property_for === "Sell" ? "for Sale" : "for Rent";
  const location = property.location_id || "";
  const city = property.city || "";
  const titleParts = [bhk, subType, propertyName, builderName]
    .filter(Boolean)
    .join(" ");
  const title =
    `${titleParts} ${propertyForText} in ${location} ${city}`.trim();
  const description = `Explore ${titleParts.toLowerCase()} ${propertyForText.toLowerCase()} in ${location} ${city}. ${
    property.description?.slice(0, 150) ||
    "Find your dream property with modern amenities and prime location."
  }`;
  const keywords = [
    `${titleParts} ${propertyForText} in ${location} ${city}`,
    `${bhk} ${subType} in ${location}`,
    `${propertyName} by ${property.builder_name}`,
    `${subType} for sale in ${city}`,
    `${bhk} ${subType} for sale in ${city}`,
    `${bhk} ${subType} for sale in ${location}`,
    `${bhk} flats for sale in ${city}`,
    `${bhk} flats for sale in ${location}`,
    `${bhk} apartments for sale in ${city}`,
    `${bhk} apartments for sale in ${location}`,
    `${subType} for sale near ${location}`,
    `luxury ${subType.toLowerCase()} in ${city}`,
    `ready to move ${subType.toLowerCase()} in ${city}`,
    `under construction ${subType.toLowerCase()} in ${city}`,
    `new projects in ${city}`,
    `best residential projects in ${city}`,
    `buy ${bhk} ${subType.toLowerCase()} in ${city}`,
    `top builders in ${city}`,
    `properties for sale in ${city}`,
    `real estate in ${city}`,
    `MeetOwner properties in ${city}`,
    `${bhk} ${subType.toLowerCase()} price in ${location} ${city}`,
  ]
    .filter(Boolean)
    .join(", ");
  const propertyFor = property.property_for === "Rent" ? "rent" : "sale";
  const bhkPart = property.bedrooms ? `${property.bedrooms}-bhk-` : "";
  const subTypePart = subType ? `${slugify(subType)}-` : "";
  const propertyNameSlug = propertyName ? slugify(propertyName) : "";
  const builderNameSlug = property.builder_name
    ? `-by-${slugify(property.builder_name)}`
    : "";
  const locationSlug = slugify(location);
  const citySlug = slugify(city) || "hyderabad";
  const forPart = `for-${propertyFor}-`;
  const seoSlug = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
  const canonicalUrl = `https://www.meetowner.in/property/${seoSlug}/${id}`;
  return { title, description, keywords, canonicalUrl };
}

async function fetchProperty(propertyId) {
  const response = await fetch(
    `${config.awsApiUrl}/listings/v1/gspmeet?unique_property_id=${propertyId}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const encryptedText = data.property;

  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  if (!JWT_SECRET) throw new Error("Encryption secret not configured");

  if (!encryptedText || !encryptedText.includes(":")) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivStr, cipherStr] = encryptedText.split(":");

  // Auto-detect HEX or Base64
  const isHex = /^[0-9a-fA-F]+$/.test(ivStr);

  const iv = Buffer.from(ivStr, isHex ? "hex" : "base64");
  const encryptedData = Buffer.from(cipherStr, isHex ? "hex" : "base64");

  // CryptoJS SHA256 key
  const key = crypto.createHash("sha256").update(JWT_SECRET).digest();

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  decipher.setAutoPadding(true); // PKCS7 (CryptoJS default)

  let decrypted = decipher.update(encryptedData, undefined, "utf8");
  decrypted += decipher.final("utf8");

  if (!decrypted) throw new Error("Decryption failed");

  return JSON.parse(decrypted);
}
function buildStructuredData(property, canonicalUrl) {
  if (!property) return null;
  const {
    bedrooms,
    bathrooms,
    area,
    price,
    property_for,
    sub_type,
    description,
    image,
    location_id,
    city,
    floor,
    amenities,
    latitude,
    longitude,
    updated_at,
  } = property;
  const isSale = property_for === "Sell";
  const offerType = isSale
    ? "https://schema.org/SellAction"
    : "https://schema.org/RentAction";
  const availability = isSale
    ? "https://schema.org/InStock"
    : "https://schema.org/LeaseOut";
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Apartment", "RealEstateListing"],
    "@id": canonicalUrl,
    name: `${bedrooms ? `${bedrooms} BHK ` : ""}${
      sub_type || "Apartment"
    } in ${location_id}, ${city}`,
    description: description || "Property details available on MeetOwner.",
    image: image
      ? `https://api.meetowner.in/aws/v1/s3/uploads/${image}`
      : "https://www.meetowner.in/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      addressLocality: location_id,
      addressRegion: city,
      addressCountry: "IN",
    },
    numberOfRooms: bedrooms + 1,
    numberOfBathrooms: bathrooms || 2,
    floorSize: {
      "@type": "QuantitativeValue",
      value: area,
      unitText: "sq ft",
    },
    offers: {
      "@type": "Offer",
      price: price ? `${price} INR` : null,
      priceCurrency: "INR",
      availability,
      businessFunction: offerType,
      validFrom: updated_at || new Date().toISOString().split("T")[0],
      seller: {
        "@type": "RealEstateAgent",
        name: "MeetOwner",
        url: "https://www.meetowner.in",
      },
      url: canonicalUrl,
    },
    amenities: amenities
      ? amenities.split(",").map((a) => ({ "@type": "Text", name: a.trim() }))
      : [],
  };
  if (floor) schema.floorLevel = `Level ${floor}`;
  if (latitude && longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }
  return schema;
}
function parseLegacyQuery(searchParams) {
  if (!searchParams || typeof searchParams !== "object") return null;
  const queryKey = Object.keys(searchParams)[0];
  if (!queryKey) return null;
  const match = queryKey.match(/(.+)_Id_(MO-\d+)$/);
  if (match) {
    return { propertyId: match[2], rawSlug: match[1] };
  }
  return null;
}
export async function generateMetadata({ params, searchParams }) {
  const pathSegments = params.params || [];
  let propertyId = null;
  let isLegacyQuery = false;
  const legacy = parseLegacyQuery(searchParams);
  if (legacy) {
    propertyId = legacy.propertyId;
    isLegacyQuery = true;
  } else if (pathSegments && pathSegments.length > 0) {
    propertyId = pathSegments.at(-1);
  }
  if (!propertyId || !propertyId.startsWith("MO-")) {
    return {
      title: "Property Not Found | MeetOwner",
      description: "The requested property could not be found.",
      robots: { index: false, follow: false },
    };
  }
  try {
    const property = await fetchProperty(propertyId);
    if (!property) {
      return {
        title: "Property Not Found | MeetOwner",
        description: "The requested property could not be found.",
        robots: { index: false, follow: false },
      };
    }
    const { title, description, keywords, canonicalUrl } = buildSeoContent(
      property,
      propertyId
    );
    const imageUrl = property.image
      ? property.image.startsWith("http")
        ? property.image
        : `https://api.meetowner.in/aws/v1/s3/uploads/${property.image}`
      : "https://meetowner.in/favicon.ico";
    const structuredData = buildStructuredData(property, canonicalUrl);
    const robots = isLegacyQuery
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
          },
        };
    return {
      title,
      description,
      keywords,
      robots,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        type: "website",
        locale: "en_IN",
        url: canonicalUrl,
        siteName: "Meet Owner",
        images: [
          {
            url: imageUrl,
            width: 600,
            height: 400,
            alt: `${property.property_name || "Property"} - ${
              property.city_id || ""
            }`,
          },
        ],
        tags: [property.sub_type, `${property.bedrooms} BHK`, property.city],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 600,
            height: 400,
            alt: `${property.property_name || "Property"} - ${
              property.city_id || ""
            }`,
          },
        ],
      },
      other: {
        "application/ld+json": JSON.stringify(structuredData),
      },
    };
  } catch (err) {
    console.error("Metadata generation error:", err);
    return {
      title: "Property Error | MeetOwner",
      description: "Unable to load property details.",
      robots: { index: false, follow: false },
    };
  }
}
const fetchLatestProperties = async () => {
  try {
    const response = await fetch(
      `${config.awsApiUrl}/adAssets/v1/getAds?ads_page=listing_ads&city`
    );
    const data = await response.json();
    const validProperties = data.ads.filter(
      (item) => item?.image && item?.property_name
    );
    return validProperties;
  } catch (err) {
    console.error("Failed to fetch properties:", err);
  }
};
const fetchUserProperties = async (userId) => {
  if (!userId) return [];
  try {
    const response = await fetch(
      `${config.awsApiUrl}/listings/v1/getPropertiesByUserID?user_id=${userId}`,
      { cache: "no-store" }
    );
    const data = await response.json();
    return data.properties || [];
  } catch (err) {
    console.error("Failed to fetch user properties:", err);
    return [];
  }
};
const fetchPropertyVideos = async (unique_property_id) => {
  if (!unique_property_id) return;

  try {
    const response = await fetch(
      `https://api.meetowner.in/property/getpropertyvideos?unique_property_id=${unique_property_id}`
    );
    const data = await response.json();
    return data?.videos;
  } catch (err) {
    console.error("Failed to fetch videos:", err);
  }
};
const fetchFloorPlans = async (unique_property_id) => {
  try {
    const res = await fetch(
      `${config.awsApiUrl}/listings/v1/getAllFloorPlans/${unique_property_id}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data?.[0] || null;
  } catch (err) {
    console.error("Floor plan fetch error:", err);
    return null;
  }
};
const fetchPropertyImages = async (unique_property_id) => {
  try {
    const res = await fetch(
      `https://api.meetowner.in/property/getpropertyphotos?unique_property_id=${unique_property_id}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data?.images || [];
  } catch (err) {
    console.error("Image fetch error:", err);
    return [];
  }
};
const fetchNearbyProperties = async (unique_property_id) => {
  try {
    const res = await fetch(
      `${config.awsApiUrl}/listings/v1/getAroundThisProperty?id=${unique_property_id}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data?.results || [];
  } catch (err) {
    console.error("Nearby fetch error:", err);
    return [];
  }
};

export default async function PropertyPage({ params, searchParams }) {
  const ads = await fetchLatestProperties();
  const pathSegments = params?.params || [];
  let propertyId = null;
  let pathSegmentsForClient = pathSegments;
  const legacy = parseLegacyQuery(searchParams);
  if (legacy) {
    propertyId = legacy.propertyId;
    pathSegmentsForClient = [legacy.rawSlug, propertyId];
  } else if (pathSegments && pathSegments.length > 0) {
    propertyId = pathSegments.at(-1);
  }
  if (!propertyId || !propertyId.startsWith("MO-")) {
    return (
      <PropertyClient
        property={null}
        loading={false}
        error="Invalid property ID in URL"
        pathSegments={pathSegmentsForClient}
        ads={ads}
      />
    );
  }
  let property = null;
  let userProperties = [];
  let videos = [];
  let floorPlan = null;
  let images = [];
  let nearby = [];
  let error = null;
  let loading = true;
  try {
    loading = false;
    property = await fetchProperty(propertyId);
    if (property?.user_id) {
      userProperties = await fetchUserProperties(property.user_id);
      videos = await fetchPropertyVideos(property.unique_property_id);
      floorPlan = await fetchFloorPlans(property.unique_property_id);
      images = await fetchPropertyImages(property.unique_property_id);
      nearby = await fetchNearbyProperties(property.unique_property_id);
    }
    if (!property) error = "Property not found";
  } catch (err) {
    loading = false;
    error = err.message || "Failed to fetch property";
    console.error("Property fetch error:", err);
  }
  return (
    <PropertyClient
      property={property}
      floorPlan={floorPlan}
      images={images}
      nearby={nearby}
      userProperties={userProperties}
      loading={loading}
      error={error}
      pathSegments={pathSegmentsForClient}
      ads={ads}
      videos={videos}
    />
  );
}
