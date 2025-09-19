"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; 
import { ToastContainer } from "react-toastify";
import Footer from "../../components/Footer";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { setPropertyDetails } from "../../components/store/slices/propertyDetails";
import config from "../../components/utils/config";
import CryptoJS from "crypto-js";

const PropertyHeader = dynamic(() => import("../../components/property/PropertyHeader"), { ssr: false });
const Breadcrumb = dynamic(() => import("../../components/utils/BreadCrumb"), { ssr: false });
const PropertyBody = dynamic(() => import("../../components/property/PropertyBody"), { ssr: false });
const PropertyDetails = dynamic(() => import("../../components/property/PropertyDetails"), { ssr: false });

export default function PropertyClient({ property, error: initialError, rawQuery , loading }) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [localProperty, setLocalProperty] = useState(property);
  const [error, setError] = useState(initialError);
  const dispatch = useDispatch();
  const searchParams = useSearchParams(); 

  const extractPropertyId = (query) => {
    if (!query) return null;
    const parts = query.split("Id_");
    return parts.length > 1 ? parts[1] : null;
  };

  const fetchProperty = async (propertyId) => {
    try {
      setPropertyLoading(true);
      const response = await fetch(
        `${config.awsApiUrl}/listings/v1/gspmeet?unique_property_id=${propertyId}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();
      if (!data.property) throw new Error("No property data");

      const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
      if (!JWT_SECRET) throw new Error("Encryption secret missing");

      const ENCRYPTION_KEY = CryptoJS.SHA256(JWT_SECRET).toString();
      const [ivHex, encryptedHex] = data.property.split(":");
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted },
        CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
        { iv }
      );

      const decryptedJson = decrypted.toString(CryptoJS.enc.Utf8);
      const fetchedProperty = JSON.parse(decryptedJson);

      setLocalProperty(fetchedProperty);
      dispatch(setPropertyDetails(fetchedProperty));
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(err.message || "Failed to load property");
    } finally {
      setPropertyLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

useEffect(() => {
  if (property && Object.keys(property).length > 0) {
    dispatch(setPropertyDetails(property));
    setPropertyLoading(false);
  } else {
    const id = searchParams.get("id") || extractPropertyId(searchParams.toString().split("=")[0]);  
    if (id) {
      fetchProperty(id);
    } else {
      setError("Invalid property ID");
      setPropertyLoading(false);
    }
  }
}, [property, searchParams, dispatch, rawQuery]);

  if (error || !localProperty || Object.keys(localProperty).length === 0) {
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

  if (loading || propertyLoading) { {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        <p className="ml-3 text-lg font-medium text-blue-900">
          Loading property details...
        </p>
      </div>
    );
  }
}
  return (
    <div className="min-h-screen flex flex-col">
      <PropertyHeader setHeaderHeight={setHeaderHeight} />
      <div
        className="flex flex-col lg:flex-row w-full max-w-[1536px] mx-auto justify-between h-auto sm:p-3 gap-3"
        style={{ paddingTop: `${headerHeight || 10}px` }}
      >
        <div className="w-full lg:w-[70%]">
          <Breadcrumb />
          <PropertyBody handleLoading={setPropertyLoading} propertyDataDetails={property} />
        </div>
        <div className="hidden lg:block w-[30%]">
          <PropertyDetails  propertyDataDetails={property} />
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
      {!propertyLoading || !loading && (
        <div className="mt-8 w-full">
          <Footer />
        </div>
      )}
    </div>
  );
}