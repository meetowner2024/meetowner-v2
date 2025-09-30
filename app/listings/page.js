import ListingsPageClient from "./ListingsPageClient";
import CryptoJS from "crypto-js";
async function fetchPropertiesForSEO(params) {
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  const ENCRYPTION_KEY = CryptoJS.SHA256(JWT_SECRET);
  function decrypt(encryptedText) {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      ENCRYPTION_KEY,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  try {
    const validPropertyIn = ["Residential", "Commercial", "Plot"];
    if (params?.property_in && !validPropertyIn.includes(params.property_in)) {
      return null;
    }

    const queryParams = {
      page: 1,
      limit: 1,
      property_for: params?.tab === "Rent" ? "Rent" : "Sell",
      property_in: params?.property_in || "Residential",
      sub_type: params?.sub_type || "",
      search: params?.location || "",
      city: params?.city || "Hyderabad",
    };

    const queryString = new URLSearchParams(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== "" && value !== undefined
      )
    ).toString();
    const apiUrl = `http://localhost:5000/listings/v1/gapbType?${queryString}`;
    const res = await fetch(apiUrl, { cache: "no-cache" });
    const data = await res.json();
    if (!data.data) {
      return;
    }
    let decrypted;
    try {
      decrypted = decrypt(data.data);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Failed to decrypt API response");
    }

    const parsed = JSON.parse(decrypted);
    return parsed?.properties?.length > 0 ? parsed.properties : null;
  } catch (err) {
    console.error("fetchPropertiesForSEO failed:", err.message);
    return null;
  }
}
export async function generateMetadata({ searchParams }) {
  const paramsObj = await searchParams;
  const params = {};

  for (const key in paramsObj) {
    const [paramKey, paramValue] = key.split("-");
    if (paramKey && paramValue) {
      params[paramKey] = decodeURIComponent(paramValue.replace(/\+/g, " "));
    }
  }

  const properties = await fetchPropertiesForSEO(params);
  if (!properties) {
    return {
      robots: "noindex, nofollow",
      description: "meetowner",
      title: "meetowner",
      keywords: "",
      openGraph: null,
      twitter: null,
      alternates: null,
    };
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

  let propertyStatus =
    propertyFor.toLowerCase() === "rent" ? "for Rent" : "for Sale";
  if (tab) {
    if (tab.toLowerCase() === "rent") propertyStatus = "for Rent";
    else if (tab.toLowerCase() === "buy") propertyStatus = "for Sale";
  }

  const propertyTypeParts = [];
  if (bhk) propertyTypeParts.push(`${bhk} BHK`);
  if (subType) propertyTypeParts.push(subType);
  if (!["other", "others"].includes(propertyIn.toLowerCase())) {
    propertyTypeParts.push(propertyIn);
  }

  const propertyTypeStr = propertyTypeParts.reverse().join(" ");
  const locationStr = location ? `${location}, ${city}` : city;

  const pageTitle = `Best ${propertyTypeStr} in ${locationStr} ${propertyStatus}`;
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

  const normalizedParams = { ...params, property_in: propertyIn };
  const queryString = new URLSearchParams(
    Object.entries(normalizedParams).map(([key, value]) => [
      `${key}-${value}`,
      "",
    ])
  ).toString();
  const featuredImages = properties
    .filter((p) => p?.image)
    .map((p) => ({
      url: `https://api.meetowner.in/aws/v1/s3/uploads/${p.image}`,
      width: 600,
      height: 400,
      alt: `${p.property_name || "Property"} - Property Image`,
    }));

  if (featuredImages.length === 0) {
    featuredImages.push({
      url: "https://placehold.co/600x400?text=Property+Image",
      width: 600,
      height: 400,
      alt: "Property Image Placeholder",
    });
  }
const imagesForListing= featuredImages.map((e)=>e.url)

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
      images: imagesForListing[0],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
       images: imagesForListing[0],
    },
    alternates: {
      canonical: `https://www.meetowner.in/listings?${queryString}`,
    },
  };
}

export default function Page() {
  return <ListingsPageClient />;
}
