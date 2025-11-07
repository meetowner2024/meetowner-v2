import CryptoJS from "crypto-js";
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
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  if (!JWT_SECRET) {
    throw new Error("Encryption secret not configured");
  }
  const ENCRYPTION_KEY = CryptoJS.SHA256(JWT_SECRET).toString();
  const [ivHex, encryptedHex] = data.property?.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted data format");
  }
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: encrypted },
    CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
    { iv }
  );
  const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
  if (!decryptedStr) {
    throw new Error("Decryption failed");
  }
  return JSON.parse(decryptedStr);
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

// Helper to parse legacy query string (e.g., ?3-bhk-apartment-for-sale-in-manchirevula_Id_MO-468837)
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

  // Check for legacy query param first
  const legacy = parseLegacyQuery(searchParams);
  if (legacy) {
    propertyId = legacy.propertyId;
    isLegacyQuery = true;
  } else if (pathSegments && pathSegments.length > 0) {
    // Fallback to path segments
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
    const featureImage = property.image || "assets/Images/Favicon@10x.png";
    const featureUrl = `https://api.meetowner.in/aws/v1/s3/uploads/${featureImage}`;
    const structuredData = buildStructuredData(property, canonicalUrl);

    // If legacy query, set noindex but canonical to clean URL
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
        siteName: "MeetOwner",
        images: [
          {
            url: featureUrl,
            width: 1200,
            height: 630,
            alt: `${title} - Premium Property in ${property.location_id}`,
            type: "image/jpeg",
          },
        ],
        tags: [property.sub_type, `${property.bedrooms} BHK`, property.city],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        site: "@meetowner",
        creator: "@meetowner",
        images: [
          {
            url: featureUrl,
            alt: `${title} - Property Listing`,
            width: 1200,
            height: 675,
          },
        ],
      },
      verification: {
        google: "your-google-site-verification-code",
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

export default async function PropertyPage({ params, searchParams }) {
  const pathSegments = params?.params || [];
  let propertyId = null;
  let pathSegmentsForClient = pathSegments;

  // Check for legacy query param first
  const legacy = parseLegacyQuery(searchParams);
  if (legacy) {
    propertyId = legacy.propertyId;
    // Optionally, set pathSegments to mimic clean path for client
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
      />
    );
  }

  let property = null;
  let error = null;
  let loading = true;

  try {
    loading = false;
    property = await fetchProperty(propertyId);
    if (!property) error = "Property not found";
  } catch (err) {
    loading = false;
    error = err.message || "Failed to fetch property";
    console.error("Property fetch error:", err);
  }

  return (
    <PropertyClient
      property={property}
      loading={loading}
      error={error}
      pathSegments={pathSegmentsForClient}
    />
  );
}
