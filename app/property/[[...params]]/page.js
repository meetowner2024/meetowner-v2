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
  const data = await response.json();
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  const ENCRYPTION_KEY = CryptoJS.SHA256(JWT_SECRET).toString();
  const [ivHex, encryptedHex] = data.property?.split(":");
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: encrypted },
    CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
    { iv }
  );
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
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
  } = property;
  const isSale = property_for === "Sell";
  const offerType = isSale
    ? "https://schema.org/SellAction"
    : "https://schema.org/RentAction";
  const availability = isSale
    ? "https://schema.org/InStock"
    : "https://schema.org/LeaseOut";
  return {
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
    floorLevel: property.floor ? `Level ${property.floor}` : null,
    offers: {
      "@type": "Offer",
      price: price ? `${price} INR` : null,
      priceCurrency: "INR",
      availability,
      businessFunction: offerType,
      validFrom: property.updated_at || new Date().toISOString().split("T")[0],
      seller: {
        "@type": "RealEstateAgent",
        name: "MeetOwner",
        url: "https://www.meetowner.in",
      },
      url: canonicalUrl,
    },
    amenities: property.amenities
      ? property.amenities
          .split(",")
          .map((a) => ({ "@type": "Text", name: a.trim() }))
      : [],
    geo:
      property.latitude && property.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          }
        : null,
  };
}
export async function generateMetadata({ params }) {
  const pathSegments = params.params || [];
  if (!pathSegments || pathSegments.length === 0) {
    return {
      title: "Property Not Found | MeetOwner",
      description: "The requested property could not be found.",
      robots: { index: false, follow: false },
    };
  }
  const propertyId = pathSegments.at(-1);
  if (!propertyId || !propertyId.startsWith("MO-")) {
    return {
      title: "Invalid Property | MeetOwner",
      description: "Invalid property identifier.",
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
    return {
      title,
      description,
      keywords: keywords.join(", "),
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
        },
      },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        type: "realestate",
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
export default async function PropertyPage({ params }) {
  const pathSegments = params?.params || [];
  if (!pathSegments || pathSegments.length === 0) {
    return (
      <PropertyClient
        property={null}
        loading={false}
        error="No URL segments provided"
        pathSegments={pathSegments}
      />
    );
  }
  const propertyId = pathSegments.at(-1);
  let property = null;
  let error = null;
  let loading = true;
  if (!propertyId || !propertyId.startsWith("MO-")) {
    error = "Invalid property ID in URL";
  } else {
    try {
      loading = false;
      property = await fetchProperty(propertyId);
      if (!property) error = "Property not found";
    } catch (err) {
      loading = false;
      error = err.message || "Failed to fetch property";
    }
  }
  return (
    <PropertyClient
      property={property}
      loading={loading}
      error={error}
      pathSegments={pathSegments}
    />
  );
}
