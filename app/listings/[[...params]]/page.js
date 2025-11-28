import config from "@/components/utils/config";
import ListingsPageClient from "../ListingsPageClient";
import crypto from "crypto";
import { cache } from "react";
const decryptData = (encryptedText, secret) => {
  if (!encryptedText || !secret) return null;
  try {
    const [ivStr, cipherStr] = encryptedText.split(":");
    const isHex = /^[0-9a-fA-F]+$/.test(ivStr);
    const iv = Buffer.from(ivStr, isHex ? "hex" : "base64");
    const encryptedData = Buffer.from(cipherStr, isHex ? "hex" : "base64");
    const key = crypto.createHash("sha256").update(secret).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(encryptedData, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
const fetchPropertiesForSEO = cache(async (params) => {
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
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
  try {
    const apiUrl = `${config.awsApiUrl}/listings/v1/gapbType?${queryString}`;
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.data) return null;
    const parsed = decryptData(data.data, JWT_SECRET);
    return parsed?.properties?.length > 0 ? parsed.properties : null;
  } catch (err) {
    console.error("fetchPropertiesForSEO failed:", err);
    return null;
  }
});
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
  const markerIdx = Math.max(parts.indexOf("sale"), parts.indexOf("rent"));
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
const fetchListingAds = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getListingAds`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return { ready_to_move: [], under_construction: [] };
    const data = await res.json();
    return {
      ready_to_move: data.ready_to_move?.properties || [],
      under_construction: data.under_construction?.properties || [],
    };
  } catch (e) {
    return { ready_to_move: [], under_construction: [] };
  }
};
const fetchLatestProperties = async () => {
  try {
    const response = await fetch(
      `${config.awsApiUrl}/adAssets/v1/getAds?ads_page=listing_ads&city`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.ads?.filter((item) => item?.image && item?.property_name) || [];
  } catch (err) {
    return [];
  }
};
const fetchAllAds = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllAds`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const { results = [] } = await res.json();
    return results;
  } catch (e) {
    return [];
  }
};
export async function generateMetadata({ params, searchParams }) {
  const pathSegments = params?.params || [];
  const defaultMeta = {
    title: "Properties for Sale in Hyderabad | Meet Owner",
    description:
      "Explore residential and commercial properties for sale in Hyderabad.",
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
        { url: "https://meetowner.in/favicon.ico", width: 600, height: 400 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Properties for Sale in Hyderabad | Meet Owner",
      description:
        "Explore residential and commercial properties for sale in Hyderabad.",
      images: ["https://meetowner.in/favicon.ico"],
    },
    alternates: { canonical: "https://www.meetowner.in/listings" },
  };
  if (!pathSegments.length) return defaultMeta;
  const parsedParams = parseSEOParamsServer(pathSegments);
  if (!parsedParams) return { robots: "noindex, nofollow", title: "meetowner" };
  const properties = await fetchPropertiesForSEO(parsedParams);
  const { city, location, property_for, tab, property_in, sub_type, bhk } =
    parsedParams;
  const safePropertyIn = ["Residential", "Commercial", "Plot"].includes(
    property_in
  )
    ? property_in
    : "Residential";
  const propertyStatus =
    tab === "Rent" || property_for === "Rent" ? "for Rent" : "for Sale";
  const propertyTypeParts = [
    bhk ? `${bhk} BHK` : null,
    sub_type,
    !["other", "others"].includes(safePropertyIn.toLowerCase())
      ? safePropertyIn
      : null,
  ]
    .filter(Boolean)
    .reverse()
    .join(" ");
  const locationStr = location ? `${location}, ${city}` : city;
  const pageTitle = `${propertyTypeParts} in ${locationStr} ${propertyStatus} | Meet Owner`;
  const pageDescription = `Explore ${propertyTypeParts} in ${locationStr} ${propertyStatus}. Find the best listings for your dream home.`;
  const slugify = (text) =>
    text
      ?.toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-") || "";
  const parts = [
    bhk ? `${bhk}-bhk` : "",
    safePropertyIn.toLowerCase(),
    sub_type ? slugify(sub_type) : "",
    `for-${property_for.toLowerCase() === "rent" ? "rent" : "sale"}`,
  ].filter(Boolean);
  const locationSegment = location
    ? `in-${slugify(location)}-${slugify(city)}`
    : `in-${slugify(city)}`;
  const canonicalUrl = `https://www.meetowner.in/listings/${parts.join(
    "-"
  )}-${locationSegment}`;
  const featuredImages =
    properties
      ?.filter((p) => p?.image)
      .map((p) => ({
        url: `https://api.meetowner.in/aws/v1/s3/uploads/${p.image}`,
        width: 600,
        height: 400,
        alt: `${p.property_name || "Property"} - Property Image`,
      })) || [];
  const mainImage =
    featuredImages.length > 0
      ? featuredImages[0]
      : defaultMeta.openGraph.images[0];
  return {
    title: pageTitle,
    description: pageDescription,
    keywords: defaultMeta.keywords,
    robots: "index, follow",
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: "website",
      siteName: "Meet Owner",
      images: mainImage,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: mainImage,
    },
    alternates: { canonical: canonicalUrl },
  };
}
export default async function Page({ params }) {
  const pathSegments = params?.params || [];
  const [listingAds, getAds, promotionalBannerAds] = await Promise.all([
    fetchListingAds(),
    fetchLatestProperties(),
    fetchAllAds(),
  ]);
  return (
    <ListingsPageClient
      initialParams={pathSegments}
      listingAds={listingAds}
      getAds={getAds}
      promotionalBannerAds={promotionalBannerAds}
    />
  );
}
