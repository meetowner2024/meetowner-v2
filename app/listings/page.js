"use client";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { setSearchData } from "../../components/store/slices/searchSlice";
import Head from "next/head";

const ListingHeader = dynamic(
  () => import("../../components/listings/ListingHeader"),
  {
    ssr: true,
  }
);
const ListingsBody = dynamic(
  () => import("../../components/listings/ListingsBody"),
  {
    ssr: true,
  }
);
const ListingAds = dynamic(
  () => import("../../components/listings/ListingAds"),
  {
    ssr: true,
  }
);
const LoginModal = dynamic(() => import("../../components/utils/LoginModal"), {
  ssr: false,
});

const Page = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ads, setAds] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const queryParams = Object.fromEntries(searchParams.entries());

    const validKeys = [
      "city",
      "location",
      "tab",
      "property_for",
      "property_in",
      "bhk",
      "budget",
      "sub_type",
      "occupancy",
      "furnished_status",
      "property_status",
      "plot_subType",
      "commercial_subType",
    ];

    const parsedParams = {};
    Object.keys(queryParams).forEach((key) => {
      const [paramKey, paramValue] = key.split("-");
      if (validKeys.includes(paramKey) && paramValue) {
        parsedParams[paramKey] = decodeURIComponent(paramValue);
      }
    });

    if (Object.keys(parsedParams).length > 0) {
      dispatch(
        setSearchData({
          location: parsedParams.location,
        })
      );
      dispatch(setSearchData(parsedParams));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function getAllAds() {
      try {
        const res = await fetch(`/api/getAllAds`, {
          cache: "force-cache",
        });
        const data = await res.json();
        setAds(data.results || []);
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      }
    }
    getAllAds();
  }, []);

  const handleClose = () => setShowLoginModal(false);
  // Extract search parameters for metadata
  const city = searchParams.get("city") || "India";
  const propertyFor = searchParams.get("property_for") || "Buy or Rent";
  const propertyIn =
    searchParams.get("property_in") || "Residential or Commercial";
  const subType = searchParams.get("sub_type") || "";
  const bhk = searchParams.get("bhk") || "";

  // Construct dynamic metadata
  const pageTitle = `${propertyFor} ${
    bhk ? bhk + " BHK " : ""
  }${subType} ${propertyIn} Properties in ${city}`;
  const pageDescription = `Explore a wide range of ${propertyFor.toLowerCase()} ${
    bhk ? bhk + " BHK " : ""
  }${subType.toLowerCase()} ${propertyIn.toLowerCase()} properties in ${city}. Find your dream home or investment property today.`;
  const keywords = `${propertyFor.toLowerCase()} properties, ${subType.toLowerCase()} in ${city}, ${
    bhk ? bhk + " BHK" : ""
  } properties, real estate ${city}, ${propertyIn.toLowerCase()} properties`;

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
        <meta
          property="og:url"
          content={typeof window !== "undefined" ? window.location.href : ""}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: pageTitle,
            description: pageDescription,
            url: typeof window !== "undefined" ? window.location.href : "",
          })}
        </script>
        <meta property="og:site_name" content="Meetowner" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="/listings" />
      </Head>
      <ListingHeader
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        ads={ads}
      />
      <div className="flex flex-col lg:flex-row w-full justify-center h-auto pt-5 sm:pt-24 md:pt-24 lg:pt-5 gap-4">
        <div className="flex w-full max-w-[1400px] flex-col md:flex-row gap-6">
          <div className="w-full md:w-[70%]">
            <ListingsBody
              showLoginModal={showLoginModal}
              setShowLoginModal={setShowLoginModal}
            />
          </div>
          <div className="hidden md:block z-0 w-full md:w-[30%]">
            <ListingAds ads={ads} />
          </div>
        </div>
      </div>
      <LoginModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        onClose={handleClose}
        modalRef={modalRef}
      />
      <ToastContainer />
    </>
  );
};

export default Page;
