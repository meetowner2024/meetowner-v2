"use client";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Footer from "../../components/Footer";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import CryptoJS from "crypto-js";
import config from "../../components/utils/config";
import { useDispatch } from "react-redux";
import { setPropertyDetails } from "../../components/store/slices/propertyDetails";
import Head from "next/head";

const PropertyHeader = dynamic(
  () => import("../../components/property/PropertyHeader"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../components/utils/BreadCrumb"), {
  ssr: false,
});
const PropertyBody = dynamic(
  () => import("../../components/property/PropertyBody"),
  { ssr: false }
);
const PropertyDetails = dynamic(
  () => import("../../components/property/PropertyDetails"),
  { ssr: false }
);

const Property = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.toString();
  const id = rawQuery.split("Id_")[1]?.split(/[=&]/)[0];
  const dispatch = useDispatch();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  const ENCRYPTION_KEY = CryptoJS.SHA256(JWT_SECRET).toString();

  function decrypt(encryptedText) {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
      { iv }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  const fetchProperty = async (propertyId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.awsApiUrl}/listings/v1/gspmeet?unique_property_id=${propertyId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }
      const data = await response.json();
      const encryptedProperty = data.property;
      const decryptedJson = decrypt(encryptedProperty);
      const parsed = decryptedJson ? JSON.parse(decryptedJson) : null;

      if (parsed) {
        setProperty(parsed);
        dispatch(setPropertyDetails(parsed));
      } else {
        throw new Error("Invalid property data received");
      }
    } catch (err) {
      setError(err.message || "Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const url = window.location.href;
    const idMatch = url.match(/Id_([^&]*)/);
    if (idMatch && idMatch[1]) {
      fetchProperty(idMatch[1]);
    } else if (id) {
      fetchProperty(id);
    } else {
      setError("No property ID found in URL");
      setLoading(false);
    }
  }, [pathname, id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        <p className="ml-3 text-lg font-medium text-blue-900">
          Loading property details...
        </p>
      </div>
    );
  }
  const pageTitle = property
    ? `${property.property_for} ${property.sub_type}${
        property.bedrooms ? ` ${property.bedrooms} BHK` : ""
      } in ${property.location_id}, ${property.city || "India"}`
    : "Property Details";
  const pageDescription = property
    ? `Explore this ${property.property_for.toLowerCase()} ${property.sub_type.toLowerCase()}${
        property.bedrooms ? ` ${property.bedrooms} BHK` : ""
      } in ${property.location_id}, ${property.city || "India"}. ${
        property.description?.slice(0, 150) || "Find your dream property today."
      }`
    : "Find the perfect property for sale or rent in India.";
  const keywords = property
    ? `${property.property_for.toLowerCase()} ${property.sub_type.toLowerCase()}, ${
        property.bedrooms ? `${property.bedrooms} BHK` : ""
      } ${property.location_id}, real estate ${
        property.city || "India"
      }, property for ${property.property_for.toLowerCase()}`
    : "property for sale, property for rent, real estate India";
  const canonicalUrl = property
    ? `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/property?${rawQuery}`
    : "";

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Head>
          <title>Property Not Found</title>
          <meta
            name="description"
            content="The requested property could not be found. Explore other properties for sale or rent."
          />
          <meta name="robots" content="noindex" />
        </Head>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          <p className="font-bold">Error loading property</p>
          <p>{error || "Property information not available"}</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={
            property.image
              ? `https://api.meetowner.in/assets/v1/serve/${property.image}`
              : "https://placehold.co/600x400?text=Property+Image"
          }
        />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="400" />
        <meta
          property="og:image:alt"
          content={`${pageTitle} - Property Image`}
        />
        <meta property="og:site_name" content="Meetowner" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta
          name="twitter:image"
          content={
            property.image
              ? `https://api.meetowner.in/assets/v1/serve/${property.image}`
              : "https://placehold.co/600x400?text=Property+Image"
          }
        />
        <meta
          name="twitter:image:alt"
          content={`${pageTitle} - Property Image`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: property.property_name,
            description: pageDescription,
            image: property.image
              ? `https://api.meetowner.in/assets/v1/serve/${property.image}`
              : "https://placehold.co/600x400?text=Property+Image",
            offers: {
              "@type": "Offer",
              price: property.property_cost || property.monthly_rent || "N/A",
              priceCurrency: "INR",
              availability:
                property.possession_status === "Immediate" ||
                property.occupancy === "Ready to move"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/PreOrder",
              url: canonicalUrl,
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: property.location_id,
              addressRegion: property.city,
              addressCountry: "IN",
            },
            category: property.sub_type,
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "Property Type",
                value: property.sub_type,
              },
              {
                "@type": "PropertyValue",
                name: "For",
                value: property.property_for,
              },
              ...(property.bedrooms
                ? [
                    {
                      "@type": "PropertyValue",
                      name: "Bedrooms",
                      value: property.bedrooms,
                    },
                  ]
                : []),
            ],
          })}
        </script>
      </Head>
      <PropertyHeader setHeaderHeight={setHeaderHeight} />
      <div
        className="flex flex-col lg:flex-row w-full max-w-[1536px] mx-auto justify-between h-auto sm:p-3 gap-3"
        style={{ paddingTop: `${headerHeight || 10}px` }}
      >
        <div className="w-full lg:w-[70%]">
          <Breadcrumb />
          <PropertyBody handleLoading={setPropertyLoading} />
        </div>
        <div className="hidden lg:block w-[30%]">
          <PropertyDetails />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {!propertyLoading && <Footer />}
    </>
  );
};

export default Property;
