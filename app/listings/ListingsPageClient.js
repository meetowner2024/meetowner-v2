"use client";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { setSearchData } from "../../components/store/slices/searchSlice";

const ListingHeader = dynamic(() => import("../../components/listings/ListingHeader"), { ssr: true });
const ListingsBody = dynamic(() => import("../../components/listings/ListingsBody"), { ssr: true });
const ListingAds = dynamic(() => import("../../components/listings/ListingAds"), { ssr: true });
const LoginModal = dynamic(() => import("../../components/utils/LoginModal"), { ssr: false });

export default function ListingsPageClient() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ads, setAds] = useState([]);
  const modalRef = useRef(null);

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
    const queryParams = Object.fromEntries(searchParams.entries());
    dispatch(setSearchData(queryParams));
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
