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
export async function generateMetadata({ params }) {
  const pathSegments = await params.params;
  if (!pathSegments || pathSegments.length === 0) {
    return {
      title: "Property Not Found | Meet Owner",
      description: "The requested property could not be found.",
      robots: "noindex",
    };
  }
  const propertyId = pathSegments.at(-1);
  try {
    const property = await fetchProperty(propertyId);
    const { title, description, keywords, canonicalUrl } = buildSeoContent(
      property,
      propertyId
    );
    const featureImage = property?.image || "assets/Images/Favicon@10x.png";
    const feature = `https://api.meetowner.in/aws/v1/s3/uploads/${featureImage}`;
    return {
      title,
      description,
      keywords,
      robots: "index, follow",
      openGraph: {
        title,
        description,
        type: "website",
        url: canonicalUrl,
        images: [
          {
            url: feature,
            width: 1200,
            height: 630,
            alt: `${title} - Property Image`,
          },
        ],
        siteName: "Meet Owner",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [{ url: feature }],
      },
      alternates: { canonical: canonicalUrl },
    };
  } catch (err) {
    console.error("Metadata generation error:", err);
    return {
      title: "Property Not Found | Meet Owner",
      description: "The requested property could not be found.",
      robots: "noindex",
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
