import CryptoJS from "crypto-js";
import config from "../../components/utils/config";
import PropertyClient from "./PropertyClient";

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

  const propertyTypeParts = [];
  if (bhkText) propertyTypeParts.push(bhkText.trim());
  if (subTypeText) propertyTypeParts.push(subTypeText);
  if (propertyInText) propertyTypeParts.push(propertyInText);
  const propertyTypeStr1 = `${
    property?.facing ? ` ${property.facing} Facing` : ""
  } ${propertyTypeParts.reverse().join(" ")} `;

  const propertyTypeStrApartmentsAndResidential = `${bhkText} ${
    property?.facing ? ` ${property.facing} Facing` : ""
  } ${subTypeText} `;
  const propertyTypeStr =
    property?.property_in === "Residential" || "Apartments"
      ? propertyTypeStrApartmentsAndResidential
      : propertyTypeStr1;
  const finalPropertyType = propertyTypeStr || subTypeText || "Property";
  const title = ` ${finalPropertyType} ${forText} in ${locationText}${cityText}`
    .replace(/\s+/g, " ")
    .trim();
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
  ]
    .filter(Boolean)
    .join(", ");

  const canonicalUrl = `https://www.meetowner.in/property?Id_=${id}`;
  return { title, description, keywords, canonicalUrl };
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;

  let id = params["Id_"] || params["id"];
  if (!id) {
    const rawQuery = Object.keys(params)[0] || "";
    if (rawQuery.includes("Id_")) id = rawQuery.split("Id_")[1];
  }

  if (!id) {
    return {
      title: "Property Not Found | Meet Owner",
      description:
        "The requested property could not be found. Explore other properties for sale or rent.",
      robots: "noindex",
    };
  }

  try {
    const response = await fetch(
      `${config.awsApiUrl}/listings/v1/gspmeet?unique_property_id=${id}`,
      { cache: "no-store" }
    );
    if (!response.ok) throw new Error(`Failed to fetch property details`);

    const data = await response.json();
    if (!data.property) throw new Error("No property data in response");

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
    const decryptedJson = decrypted.toString(CryptoJS.enc.Utf8);
    const property = JSON.parse(decryptedJson);
    const { title, description, keywords, canonicalUrl } = buildSeoContent(
      property,
      id
    );
    const feature = `https://api.meetowner.in/aws/v1/s3/uploads/${property?.image}`;
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
            width: 600,
            height: 400,
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
    return {
      title: "Property Not Found | Meet Owner",
      description: "The requested property could not be found.",
      robots: "noindex",
    };
  }
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

export default async function PropertyPage({ searchParams }) {
  const params = await searchParams;
  let id = params["Id_"] || params["id"];
  if (!id) {
    const rawQuery = Object.keys(params)[0] || "";
    if (rawQuery.includes("Id_")) id = rawQuery.split("Id_")[1];
  }

  let property = null;
  let error = null;
  let loading = true;
  if (!id) error = "No property ID found in URL";
  else {
    try {
      loading = false;
      property = await fetchProperty(id);
      if (!property) error = "Invalid property data received";
    } catch (err) {
      loading = false;
      error = err.message;
    }
  }

  return (
    <PropertyClient
      property={property}
      loading={loading}
      error={error}
      rawQuery={Object.keys(params)[0] || ""}
    />
  );
}
