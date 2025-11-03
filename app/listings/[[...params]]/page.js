import config from "@/components/utils/config";
import ListingsPageClient from "../ListingsPageClient";
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
    const apiUrl = `${config.awsApiUrl}/listings/v1/gapbType?${queryString}`;
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
    console.error("fetchPropertiesForSEO failed:", err);
    return null;
  }
}
function parseSEOParamsServer(slugArray) {
  if (!slugArray || slugArray.length === 0) return null;

  const fullSlug = slugArray.join("-").toLowerCase();

  const data = {
    bhk: "",
    property_in: "",
    sub_type: "",
    property_for: "",
    location: "",
    city: "Hyderabad",
    tab: "Buy",
  };
  const bhkMatch = fullSlug.match(/(\d+)[-]?bhk/);
  if (bhkMatch) data.bhk = bhkMatch[1];
  if (fullSlug.includes("-sale-") || fullSlug.endsWith("-sale")) {
    data.property_for = "Sell";
    data.tab = "Buy";
  } else if (fullSlug.includes("-rent-") || fullSlug.endsWith("-rent")) {
    data.property_for = "Rent";
    data.tab = "Rent";
  }
  if (fullSlug.includes("residential")) data.property_in = "Residential";
  else if (fullSlug.includes("commercial")) data.property_in = "Commercial";
  else if (fullSlug.includes("plot")) data.property_in = "Plot";
  const subTypes = [
    "apartment",
    "independent-house",
    "independent-villa",
    "plot",
    "land",
    "office",
    "retail-shop",
    "show-room",
    "warehouse",
  ];
  const found = subTypes.find((s) => fullSlug.includes(s));
  if (found) {
    data.sub_type = found
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const parts = fullSlug.split("-");
  const saleIdx = parts.indexOf("sale");
  const rentIdx = parts.indexOf("rent");
  const markerIdx = saleIdx !== -1 ? saleIdx : rentIdx;

  if (markerIdx !== -1 && parts.length > markerIdx + 1) {
    const after = parts.slice(markerIdx + 1).filter((p) => p !== "in");
    if (after.length >= 1) {
      data.city = after[after.length - 1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const locationParts = after.slice(0, -1);
      data.location =
        locationParts.length > 0
          ? locationParts
              .join(" ")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : "";
    }
  }

  return data;
}
export async function generateMetadata({ params, searchParams }) {
  const pathSegments = params?.params || [];
  if (!pathSegments.length) {
    return {
      title: "Properties for Sale in Hyderabad | Meet Owner",
      description:
        "Explore residential and commercial properties for sale in Hyderabad. Find apartments, villas, plots, and more.",
      keywords: "properties hyderabad, real estate hyderabad",
      robots: "index, follow",
      openGraph: {
        title: "Properties for Sale in Hyderabad | Meet Owner",
        description:
          "Explore residential and commercial properties for sale in Hyderabad.",
        url: "https://www.meetowner.in/listings",
        type: "website",
        siteName: "Meet Owner",
        images: [
          {
            url: "https://meetowner.in/favicon.ico",
            width: 600,
            height: 400,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Properties for Sale in Hyderabad | Meet Owner",
        description:
          "Explore residential and commercial properties for sale in Hyderabad.",
        images: ["https://meetowner.in/favicon.ico"],
      },
      alternates: {
        canonical: "https://www.meetowner.in/listings",
      },
    };
  }

  const parsedParams = parseSEOParamsServer(pathSegments);
  if (!parsedParams) {
    return {
      robots: "noindex, nofollow",
      title: "meetowner",
    };
  }

  const properties = await fetchPropertiesForSEO(parsedParams);
  const city = parsedParams.city || "Hyderabad";
  const location = parsedParams.location || "";
  const propertyFor = parsedParams.property_for || "Sell";
  const tab = parsedParams.tab || "";
  const propertyIn =
    parsedParams.property_in === "Residential or Commercial" ||
    !["Residential", "Commercial", "Plot"].includes(parsedParams.property_in)
      ? "Residential"
      : parsedParams.property_in;
  const subType = parsedParams.sub_type || "";
  const bhk = parsedParams.bhk || "";
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
  const pageTitle = `${propertyTypeStr} in ${locationStr} ${propertyStatus} | Meet Owner`;
  const pageDescription = `Explore ${propertyTypeStr} in ${locationStr} ${propertyStatus}. Find the best listings for your dream home.`;
  const keywords = [
    `${propertyTypeStr} in ${locationStr}`,
    `${propertyTypeStr} ${propertyStatus}`,
    `${propertyIn} properties in ${city}`,
    `real estate ${city}`,
    location ? `${propertyTypeStr} in ${location}, ${city}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const slugify = (text) => {
    if (!text) return "";
    return text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };
  const bhkPart = bhk ? `${bhk}-bhk` : "";
  const propertyInPart =
    propertyIn.toLowerCase() === "commercial"
      ? "commercial"
      : propertyIn.toLowerCase() === "plot"
      ? "plot"
      : "residential";
  const subTypePart = subType ? slugify(subType) : "";
  const propertyForPart =
    propertyFor.toLowerCase() === "rent" ? "rent" : "sale";
  const locationPart = location ? slugify(location) : "";
  const cityPart = slugify(city);

  const parts = [
    bhkPart,
    propertyInPart,
    subTypePart,
    `for-${propertyForPart}`,
  ].filter(Boolean);

  const locationSegment = locationPart
    ? `in-${locationPart}-${cityPart}`
    : `in-${cityPart}`;

  const pathSlug = `/listings/${parts.join("-")}-${locationSegment}`;
  const canonicalUrl = `https://www.meetowner.in${pathSlug}`;

  const featuredImages =
    properties
      ?.filter((p) => p?.image)
      .map((p) => ({
        url: `https://api.meetowner.in/aws/v1/s3/uploads/${p.image}`,
        width: 600,
        height: 400,
        alt: `${p.property_name || "Property"} - Property Image`,
      })) || [];
  if (featuredImages.length === 0) {
    featuredImages.push({
      url: "https://meetowner.in/favicon.ico",
      width: 600,
      height: 400,
      alt: "Property Image Placeholder",
    });
  }
  const imagesForListing = featuredImages.map((e) => e.url);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    robots: "index, follow",
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
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
      canonical: canonicalUrl,
    },
  };
}
export default function Page({ params }) {
  const pathSegments = params?.params || [];
  return <ListingsPageClient initialParams={pathSegments} />;
}
