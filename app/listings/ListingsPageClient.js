"use client";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { useEffect, useRef, useState, memo } from "react";
import { useDispatch } from "react-redux";
import { setSearchData } from "../../components/store/slices/searchSlice";
import {
  setAds,
  setListingAds,
  setPromotionalBanners,
} from "@/components/store/slices/adSlice";
import { get } from "http";
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
const ListingsPageClient = memo(function ListingsPageClient({
  initialParams,
  listingAds,
  getAds,
  promotionalBannerAds,
}) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (listingAds) {
      dispatch(setListingAds(listingAds));
    }
    if (getAds) {
      dispatch(setAds(getAds));
    }
  }, [listingAds, getAds]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const modalRef = useRef(null);
  const parseSEOParams = (slugArray) => {
    if (!slugArray.length) return {};
    const fullSlug = slugArray.join("-");
    const lower = fullSlug.toLowerCase();
    const data = {
      bhk: "",
      property_in: "",
      sub_type: "",
      property_for: "",
      location: "",
      city: "Hyderabad",
      tab: "Buy",
    };
    const bhkMatch = lower.match(/(\d+)[-]?bhk/);
    if (bhkMatch) data.bhk = bhkMatch[1];
    if (lower.includes("-sale-") || lower.endsWith("-sale")) {
      data.property_for = "Sell";
      data.tab = "Buy";
    } else if (lower.includes("-rent-") || lower.endsWith("-rent")) {
      data.property_for = "Rent";
      data.tab = "Rent";
    }
    if (lower.includes("residential")) data.property_in = "Residential";
    else if (lower.includes("commercial")) data.property_in = "Commercial";
    else if (lower.includes("plot")) data.property_in = "Plot";
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
    const found = subTypes.find((s) => lower.includes(s));
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
  };
  useEffect(() => {
    const defaults = {
      bhk: "",
      property_in: "Residential",
      sub_type: "",
      tab: "Buy",
      location: "",
      city: "Hyderabad",
    };
    let parsed;
    if (initialParams.length > 0) {
      parsed = parseSEOParams(initialParams);
    }
    const initialData = { ...defaults, ...parsed };
    dispatch(setSearchData(initialData));
    setInitialized(true);
  }, [initialParams, dispatch]);
  const adsFetched = useRef(false);
  useEffect(() => {
    if (adsFetched.current) return;
    adsFetched.current = true;
    dispatch(setPromotionalBanners(promotionalBannerAds));
  }, []);
  return (
    <>
      <ListingHeader
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
      />
      <div className="flex flex-col lg:flex-row w-full justify-center h-auto pt-5 sm:pt-24 md:pt-24 lg:pt-5 gap-4">
        <div className="flex w-full max-w-[1400px] flex-col md:flex-row gap-6">
          <div className="w-full md:w-[70%]">
            <ListingsBody
              showLoginModal={showLoginModal}
              setShowLoginModal={setShowLoginModal}
              initialized={initialized}
              listingAds={listingAds}
            />
          </div>
          {getAds.length > 0 && (
            <div className="hidden md:block w-full md:w-[30%] ">
              <ListingAds />
            </div>
          )}
        </div>
      </div>
      <LoginModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        onClose={() => setShowLoginModal(false)}
        modalRef={modalRef}
      />
      <ToastContainer />
    </>
  );
});
export default ListingsPageClient;
