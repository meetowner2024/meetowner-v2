"use client";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ads, setAds] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function getAllAds() {
      const res = await fetch(`/api/getAllAds`, {
        cache: "force-cache",
      });
      const data = await res.json();
      setAds(data.results || []);
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
          <div className="hidden md:block z-0  w-full md:w-[30%]">
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
