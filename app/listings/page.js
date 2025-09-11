"use client";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { setSearchData } from "../../components/store/slices/searchSlice";

const ListingHeader = dynamic(() => import("../../components/listings/ListingHeader"), {
  ssr: true,
});
const ListingsBody = dynamic(() => import("../../components/listings/ListingsBody"), {
  ssr: true,
});
const ListingAds = dynamic(() => import("../../components/listings/ListingAds"), {
  ssr: true,
});
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
    console.log("Raw Query Parameters:", queryParams);

    
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

    console.log("Parsed Query Parameters:", parsedParams);

    
    if (Object.keys(parsedParams).length > 0) {
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