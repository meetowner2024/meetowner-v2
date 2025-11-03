import CryptoJS from "crypto-js";
import config from "../../../components/utils/config";
import PropertyClient from "../PropertyClient";
function buildSeoContent(property, id) {
  const bhkText = property.bedrooms ? `${property.bedrooms} BHK ` : "";
  const subTypeText = property.sub_type || "";
  const propertyInText =
    property.property_in &&
    !["other", "others"].includes(property.property_in.toLowerCase())
      ? property.property_in
      : "";
  const locationText = property.location_id ? `${property.location_id} ` : "";
  const cityText = property.city || "";
  const forText = property.property_for === "Sell" ? "for Sale" : "for Rent";
  const builderText = property.builder_name
    ? `by ${property.builder_name} `
    : "";
  const propertyTypeParts = [];
  if (bhkText) propertyTypeParts.push(bhkText.trim());
  if (subTypeText) propertyTypeParts.push(subTypeText);
  if (propertyInText) propertyTypeParts.push(propertyInText);
  const propertyTypeStr = `${propertyTypeParts
    .reverse()
    .join(" ")} ${builderText}${
    property?.facing ? `${property.facing} Facing` : ""
  }`.trim();
  const finalPropertyType = propertyTypeStr || subTypeText || "Property";
  const title =
    `${finalPropertyType} ${forText} in ${locationText}${cityText}`.trim();
  const description = `Explore ${finalPropertyType.toLowerCase()} in ${locationText}${cityText} ${forText.toLowerCase()}. ${
    property.description?.slice(0, 150) ||
    "Find your dream property with modern amenities and prime location."
  }`;
  const keywords = [
    `${finalPropertyType} in ${locationText}${cityText}`,
    `${finalPropertyType} ${forText}`,
    `${property.property_for.toLowerCase()} ${finalPropertyType}`,
    locationText ? `${finalPropertyType} in ${locationText.trim()}` : "",
    cityText ? `${finalPropertyType} in ${cityText}` : "",
    property.builder_name ? `${property.builder_name} properties` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const bhkPart = property.bedrooms ? `${property.bedrooms}-bhk-` : "";
  const subTypePart = property.sub_type ? `${property.sub_type}-` : "";
  const propertyNameSlug = property.property_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const builderNameSlug = property.builder_name
    ? `-by-${property.builder_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`
    : "";
  const locationSlug = property.location_id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const citySlug = (property.city || "hyderabad")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const forPart = `for-${property.property_for === "Rent" ? "rent" : "sale"}-`;
  const seoPath = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
  const canonicalUrl = `https://www.meetowner.in/property/${seoPath}/${id}`;
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
  const [ivHex, encryptedHex] = data.property.split(":");
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
  if (!propertyId || !propertyId.startsWith("MO-")) {
    return {
      title: "Property Not Found | Meet Owner",
      description: "The requested property could not be found.",
      robots: "noindex",
    };
  }
  try {
    const property = await fetchProperty(propertyId);
    const { title, description, keywords, canonicalUrl } = buildSeoContent(
      property,
      propertyId
    );
    const featureImage =
      property?.images?.[0] ||
      property?.image?.[0] ||
      property?.image ||
      "default-property.jpg";
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
