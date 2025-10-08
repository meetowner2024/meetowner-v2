"use client";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { setSearchData } from "../../components/store/slices/searchSlice";

const ListingHeader = dynamic(
  () => import("../../components/listings/ListingHeader"),
  { ssr: true }
);
const ListingsBody = dynamic(
  () => import("../../components/listings/ListingsBody"),
  { ssr: true }
);
const ListingAds = dynamic(
  () => import("../../components/listings/ListingAds"),
  { ssr: true }
);
const LoginModal = dynamic(() => import("../../components/utils/LoginModal"), {
  ssr: false,
});

export default function ListingsPageClient() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ads, setAds] = useState([]);
  const modalRef = useRef(null);
  const currentSearchData = useSelector((state) => state.search);
  const handleClose = () => setShowLoginModal(false);

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch("/api/getAllAds", { cache: "force-cache" });
        const data = await res.json();
        setAds(data.results || []);
      } catch (err) {
        console.error("Failed to fetch ads:", err);
      }
    }
    fetchAds();
  }, []);
  useEffect(() => {
    const queryParams = {};
    const keys = Array.from(searchParams.keys());

    const bhkKey = keys.find((key) => key.startsWith("bhk-"));
    let bhk = "";
    if (bhkKey) bhk = bhkKey.split("-")[1] || "";

    const seoKey = keys.find((key) =>
      /(plot|apartment|villa).*(for-sale|forrent|for-rent|for-sale-in)/i.test(
        key
      )
    );

    if (seoKey) {
      const parts = seoKey.split("-");
      const property_for = /(sale|sell|for-sale|buy|for-sale-in)/i.test(seoKey)
        ? "Sell"
        : "Rent";

      let property_in = "Residential";
      if (parts.includes("plot")) property_in = "Plot";
      else if (parts.includes("apartment")) property_in = "Residential";
      else if (parts.includes("villa")) property_in = "Residential";

      const indiaIndex = parts.indexOf("india");
      let city = "Hyderabad";
      if (indiaIndex !== -1 && parts[indiaIndex + 1]) {
        city = parts[indiaIndex + 1];
      } else {
        city = parts[parts.length - 1];
      }
      city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

      const inIndex = parts.indexOf("in");
      let location = "";
      if (inIndex !== -1 && parts.length > inIndex + 1) {
        location = parts[inIndex + 1];
      }

      const tab = property_for === "Sell" ? "Buy" : "Rent";

      queryParams.city = decodeURIComponent(city);
      queryParams.location = decodeURIComponent(location);
      queryParams.property_in = property_in;
      queryParams.property_for = property_for;
      queryParams.tab = tab;
      queryParams.bhk = bhk;
    } else {
      for (const key of keys) {
        const [paramKey, ...rest] = key.split("-");
        const paramValue = rest.join("-");
        if (paramKey && paramValue !== undefined) {
          queryParams[paramKey] = decodeURIComponent(
            paramValue.replace(/\+/g, " ")
          );
        }
      }
      if (bhk) queryParams.bhk = bhk;
    }

    const normalizedParams = {
      city: queryParams.city || currentSearchData.city || "Hyderabad",
      property_for:
        queryParams.property_for || currentSearchData.property_for || "Sell",
      tab: queryParams.tab || currentSearchData.tab || "Buy",
      property_in:
        queryParams.property_in === "Residential or Commercial" ||
        !["Residential", "Commercial", "Plot"].includes(queryParams.property_in)
          ? currentSearchData.property_in || "Residential"
          : queryParams.property_in,
      sub_type: queryParams.sub_type || currentSearchData.sub_type || "",
      bhk: queryParams.bhk || currentSearchData.bhk || "",
      location: queryParams.location || currentSearchData.location || "",
    };

    const prev = currentSearchData;
    if (
      prev.city !== normalizedParams.city ||
      prev.property_for !== normalizedParams.property_for ||
      prev.tab !== normalizedParams.tab ||
      prev.property_in !== normalizedParams.property_in ||
      prev.sub_type !== normalizedParams.sub_type ||
      prev.bhk !== normalizedParams.bhk ||
      prev.location !== normalizedParams.location
    ) {
      dispatch(setSearchData(normalizedParams));
    }
  }, [searchParams, dispatch]);

  return (
    <>
      <ListingHeader
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        ads={ads}
      />
      <div className="flex flex-col lg:flex-row w-full justify-center h-auto pt-5 sm:pt-24 md:pt-24 lg:pt-5 gap-4">
        <div className="flex w-full max-w-[1400px] flex-col md:flex-row gap-6">
          <div className="w-full md:w-[70%]">
            <ListingsBody
              key={searchParams.toString()}
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
}
