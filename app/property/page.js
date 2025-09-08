"use client";
import {  useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Footer from "../../components/Footer";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import CryptoJS from "crypto-js";
import config from "../../components/utils/config";
import { useDispatch } from "react-redux";
import { setPropertyDetails } from "../../components/store/slices/propertyDetails";

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
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
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
      <PropertyHeader setHeaderHeight={setHeaderHeight} />
      <div
        className="flex flex-col lg:flex-row w-full max-w-[1536px] mx-auto justify-between h-auto p-3 gap-3"
        style={{ paddingTop: `${headerHeight || 10}px` }}
      >
        <div className="w-full lg:w-[70%]">
          <Breadcrumb />
          <PropertyBody />
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
      <Footer />
    </>
  );
};

export default Property;
