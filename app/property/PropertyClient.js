"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { setPropertyDetails } from "../../components/store/slices/propertyDetails";
import config from "../../components/utils/config";
import CryptoJS from "crypto-js";
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
const SkeletonBreadcrumb = () => (
  <div className="mb-4">
    <div className="flex items-center space-x-2">
      <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
    </div>
  </div>
);
const SkeletonPropertyBody = ({ handleLoading }) => (
  <div className="space-y-6">
    <div className="aspect-[4/3] bg-gray-300 rounded-lg animate-pulse"></div>
    <div className="space-y-4">
      <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
      <div className="h-4 w-5/6 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-4 w-4/6 bg-gray-300 rounded animate-pulse"></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-300 rounded animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gray-300 rounded animate-pulse"
        ></div>
      ))}
    </div>
  </div>
);
const SkeletonPropertyDetails = () => (
  <div className="space-y-6">
    <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
    <div className="space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
      </div>
      <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-4 w-4 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);
export default function PropertyClient({
  property,
  error: initialError,
  pathSegments,
  loading: initialLoading,
}) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [propertyLoading, setPropertyLoading] = useState(
    initialLoading || true
  );
  const [localProperty, setLocalProperty] = useState(property);
  const [error, setError] = useState(initialError);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const hasFetchedRef = useRef(false);
  const extractPropertyId = (segments) => {
    if (!segments || segments.length === 0) return null;
    const lastSegment = segments.at(-1);
    return lastSegment && lastSegment.startsWith("MO-") ? lastSegment : null;
  };
  const fetchProperty = async (propertyId) => {
    try {
      setPropertyLoading(true);
      const response = await fetch(
        `${config.awsApiUrl}/listings/v1/gspmeet?unique_property_id=${propertyId}`,
        {
          cache: "no-store",
          next: { revalidate: 0 },
        }
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
      dispatch(setPropertyDetails({ property: fetchedProperty }));
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(err.message || "Failed to load property");
    } finally {
      setPropertyLoading(false);
      hasFetchedRef.current = true;
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (property && Object.keys(property).length > 0) {
      dispatch(setPropertyDetails({ property }));
      setLocalProperty(property);
      setPropertyLoading(false);
      hasFetchedRef.current = true;
    }
  }, [property, dispatch]);
  useEffect(() => {
    if (property || hasFetchedRef.current) return;
    const id = extractPropertyId(pathSegments);
    if (id) {
      fetchProperty(id);
    } else {
      setError("Invalid property ID");
      setPropertyLoading(false);
      hasFetchedRef.current = true;
    }
  }, [pathSegments]);
  const isLoading =
    propertyLoading || initialLoading || (!localProperty && !error);
  const hasError = error || (!localProperty && !isLoading);
  if (hasError) {
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
    <div className="min-h-screen flex flex-col">
      <PropertyHeader setHeaderHeight={setHeaderHeight} />

      <div
        className="flex flex-col lg:flex-row w-full max-w-[1536px] mx-auto justify-between h-auto sm:p-3 gap-3 pb-20"
        style={{ paddingTop: `${headerHeight || 10}px` }}
      >
        <div className="w-full lg:w-[70%]">
          {isLoading ? <SkeletonBreadcrumb /> : <Breadcrumb />}
          {isLoading ? (
            <SkeletonPropertyBody />
          ) : (
            <PropertyBody
              handleLoading={setPropertyLoading}
              propertyDataDetails={localProperty || property}
            />
          )}
        </div>
        <div className="hidden lg:block w-[30%]">
          {isLoading ? (
            <SkeletonPropertyDetails />
          ) : (
            <PropertyDetails propertyDataDetails={localProperty || property} />
          )}
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
            <p className="text-lg font-medium text-blue-900">
              Loading property details...
            </p>
          </div>
        </div>
      )}
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
    </div>
  );
}
