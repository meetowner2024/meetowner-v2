import crypto from "crypto";
import config from "@/components/utils/config";
import PropertyClient from "../PropertyClient";
const slugify = (str) =>
  str
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const decryptProperty = (encryptedText) => {
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  if (!JWT_SECRET) throw new Error("Encryption secret missing");
  if (!encryptedText?.includes(":"))
    throw new Error("Invalid encrypted format");
  const [ivStr, cipherStr] = encryptedText.split(":");
  const isHex = /^[0-9a-fA-F]+$/.test(ivStr);
  const iv = Buffer.from(ivStr, isHex ? "hex" : "base64");
  const encrypted = Buffer.from(cipherStr, isHex ? "hex" : "base64");
  const key = crypto.createHash("sha256").update(JWT_SECRET).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted =
    decipher.update(encrypted, null, "utf8") + decipher.final("utf8");
  return JSON.parse(decrypted);
};
const api = {
  property: async (id) => {
    const res = await fetch(
      `${config.awsApiUrl}/listings/v1/gspmeet?unique_property_id=${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Property not found");
    const { property: encrypted } = await res.json();
    return decryptProperty(encrypted);
  },
  ads: async () => {
    try {
      const res = await fetch(
        `${config.awsApiUrl}/adAssets/v1/getAds?ads_page=listing_ads&city`,
        {
          next: { revalidate: 3600 },
        }
      );
      const data = await res.json();
      return (data.ads || []).filter((ad) => ad?.image && ad?.property_name);
    } catch {
      return [];
    }
  },
  userProperties: (userId) =>
    fetch(
      `${config.awsApiUrl}/listings/v1/getPropertiesByUserID?user_id=${userId}`,
      {
        cache: "no-store",
      }
    ).then((r) => r.json().then((d) => d.properties || [])),
  videos: (id) =>
    fetch(
      `https://api.meetowner.in/property/getpropertyvideos?unique_property_id=${id}`
    )
      .then((r) => r.json())
      .then((d) => d?.videos || []),
  floorPlan: (id) =>
    fetch(`${config.awsApiUrl}/listings/v1/getAllFloorPlans/${id}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => d?.[0] || null),
  images: (id) =>
    fetch(
      `https://api.meetowner.in/property/getpropertyphotos?unique_property_id=${id}`,
      {
        cache: "no-store",
      }
    )
      .then((r) => r.json())
      .then((d) => d?.images || []),
  nearby: (id) =>
    fetch(`${config.awsApiUrl}/listings/v1/getAroundThisProperty?id=${id}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => d?.results || []),
};
const buildSeoContent = (property, id) => {
  const {
    bedrooms,
    sub_type = "",
    property_name = "",
    builder_name = "",
    property_for,
    location_id = "",
    city = "Hyderabad",
    description,
  } = property;
  const bhk = bedrooms ? `${bedrooms} BHK` : "";
  const forText = property_for === "Sell" ? "for Sale" : "for Rent";
  const forSlug = property_for === "Rent" ? "rent" : "sale";
  const titleParts = [
    bhk,
    sub_type,
    property_name,
    builder_name ? `by ${builder_name}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const title = `${titleParts} ${forText} in ${location_id}, ${city}`.trim();
  const descriptionText =
    description?.slice(0, 150) ||
    "Find your dream home with modern amenities in a prime location.";
  const canonicalSlug = [
    bedrooms ? `${bedrooms}-bhk` : "",
    slugify(sub_type),
    slugify(property_name),
    builder_name ? `by-${slugify(builder_name)}` : "",
    `for-${forSlug}-in-${slugify(location_id)}-${slugify(city) || "hyderabad"}`,
  ]
    .filter(Boolean)
    .join("-");
  const canonicalUrl = `https://www.meetowner.in/property/${canonicalSlug}/${id}`;
  return {
    title,
    description: `Explore ${titleParts.toLowerCase()} ${forText.toLowerCase()} in ${location_id}, ${city}. ${descriptionText}`,
    canonicalUrl,
    imageUrl: property.image
      ? property.image.startsWith("http")
        ? property.image
        : `https://api.meetowner.in/aws/v1/s3/uploads/${property.image}`
      : "https://www.meetowner.in/og-image.jpg",
  };
};
const buildStructuredData = (property, canonicalUrl) => {
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
  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    "@id": canonicalUrl + "#listing",
    name: `${bedrooms ? `${bedrooms} BHK ` : ""}${
      sub_type || "Apartment"
    } in ${location_id}, ${city}`,
    description:
      description || "Premium residential property listed on MeetOwner.",
    url: canonicalUrl,
    image: image
      ? `https://api.meetowner.in/aws/v1/s3/uploads/${image}`
      : "https://www.meetowner.in/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: location_id,
      addressLocality: location_id,
      addressRegion: city,
      postalCode: "500001",
      addressCountry: "IN",
    },
    geo: latitude &&
      longitude && {
        "@type": "GeoCoordinates",
        latitude,
        longitude,
      },
    offers: {
      "@type": "Offer",
      price: price || 0,
      priceCurrency: "INR",
      availability: isSale
        ? "https://schema.org/InStock"
        : "https://schema.org/ForRent",
      url: canonicalUrl,
    },
    numberOfRooms: bedrooms || 1,
    floorSize: {
      "@type": "QuantitativeValue",
      value: area || 1000,
      unitCode: "SQFT",
    },
    amenityFeature: amenities
      ? amenities.split(",").map((a) => ({
          "@type": "LocationFeatureSpecification",
          name: a.trim(),
        }))
      : [],
  };
};
const parseLegacyQuery = (searchParams) => {
  if (!searchParams) return null;
  const key = Object.keys(searchParams)[0];
  const match = key?.match(/(.+)_Id_(MO-\d+)$/);
  return match ? { propertyId: match[2], rawSlug: match[1] } : null;
};
export async function generateMetadata({ params, searchParams }) {
  const segments = params.params || [];
  const legacy = parseLegacyQuery(searchParams);
  const propertyId =
    legacy?.propertyId ||
    (segments.length ? segments[segments.length - 1] : null);
  if (!propertyId?.startsWith("MO-")) {
    return {
      title: "Property Not Found | MeetOwner",
      description: "The property you're looking for does not exist.",
      robots: { index: false, follow: false },
    };
  }
  try {
    const property = await api.property(propertyId);
    const { title, description, canonicalUrl, imageUrl } = buildSeoContent(
      property,
      propertyId
    );
    return {
      title,
      description,
      keywords: `${property.bedrooms} BHK ${
        property.sub_type
      } for ${property.property_for.toLowerCase()} in ${property.location_id} ${
        property.city
      }, ${property.city} real estate`,
      alternates: { canonical: canonicalUrl },
      robots: { index: true, follow: true },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "MeetOwner",
        type: "website",
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      other: {
        "application/ld+json": JSON.stringify(
          buildStructuredData(property, canonicalUrl)
        ),
      },
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return {
      title: "Property Not Available | MeetOwner",
      robots: { index: false, follow: false },
    };
  }
}
export default async function PropertyPage({ params, searchParams }) {
  const segments = await params.params;
  const legacy = parseLegacyQuery(searchParams);
  const propertyId =
    legacy?.propertyId ||
    (segments?.length ? segments[segments?.length - 1] : null);
  const ads = await api.ads().catch(() => []);
  if (!propertyId?.startsWith("MO-")) {
    return (
      <PropertyClient
        property={null}
        error="Invalid property ID"
        ads={ads}
        pathSegments={segments}
      />
    );
  }
  let property = null;
  let error = null;
  try {
    property = await api.property(propertyId);
    const [userProperties, videos, floorPlan, images, nearby] = property.user_id
      ? await Promise.all([
          api.userProperties(property.user_id).catch(() => []),
          api.videos(property.unique_property_id),
          api.floorPlan(property.unique_property_id),
          api.images(property.unique_property_id),
          api.nearby(property.unique_property_id),
        ])
      : [[], [], null, [], []];
    return (
      <PropertyClient
        property={property}
        floorPlan={floorPlan}
        images={images}
        videos={videos}
        nearby={nearby}
        userProperties={userProperties}
        ads={ads}
        pathSegments={legacy ? [legacy.rawSlug, propertyId] : segments}
        error={null}
      />
    );
  } catch (err) {
    console.error("Property page error:", err);
    error = "Property not found or temporarily unavailable.";
    return (
      <PropertyClient
        property={null}
        error={error}
        ads={ads}
        pathSegments={segments}
      />
    );
  }
}
