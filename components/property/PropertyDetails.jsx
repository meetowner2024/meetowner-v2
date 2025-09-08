"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import config from "../utils/config";
import Image from "next/image";
import whatsappIcon from "../../app/assets/Images/whatsapp (3).png";
import { MdOutlineVerified } from "react-icons/md";
import { MapPin } from "lucide-react";
import { toast } from "react-toastify";
import Login from "../auth/Login";
import PropertyAdsColors from "../utils/dynamic-colors/PropertyAdsColors.json";
import PropertyAds from "./PropertyAds";
import axios from "axios";
import useWhatsappHook from "../utils/useWhatsappHook";
import CryptoJS from "crypto-js";
import theme from "../utils/theme.json";
const Badge = ({ children }) => (
  <span
    style={{
      backgroundColor: PropertyAdsColors.badge.background,
      color: PropertyAdsColors.badge.text,
      borderColor: PropertyAdsColors.badge.border,
    }}
    className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
  >
    {children}
  </span>
);
const Stat = ({ label, value }) => (
  <div className="rounded-xl shadow-xl border border-gray-100 bg-white hover:-translate-y-1 p-4">
    <div
      style={{ color: PropertyAdsColors.primary.text }}
      className="text-xs font-medium"
    >
      {label}
    </div>
    <div
      style={{ color: PropertyAdsColors.primary.value }}
      className="mt-1 text-lg font-semibold "
    >
      {value}
    </div>
  </div>
);
const Skeleton = () => (
  <div className="hidden lg:block p-5">
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-3/4 bg-gray-200 rounded" />
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-gray-200 rounded-full" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/4 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-2/3 bg-gray-200 rounded px-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 w-full bg-gray-200 rounded-xl" />
        <div className="h-16 w-full bg-gray-200 rounded-xl" />
        <div className="h-16 w-full bg-gray-200 rounded-xl" />
        <div className="h-16 w-full bg-gray-200 rounded-xl" />
      </div>
      <div className="px-5 mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="h-4 w-1/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-gray-300 w-2/5" />
        </div>
      </div>
      <div className="p-5 flex gap-3">
        <div className="h-11 w-2/3 bg-gray-200 rounded-lg" />
        <div className="h-11 w-1/3 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);
const Empty = ({ message = "No data found." }) => (
  <div className="hidden lg:flex items-center justify-center p-8 text-sm text-gray-500">
    {message}
  </div>
);
const PropertyDeatils = () => {
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
  const modalRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.search);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [submittedStates, setSubmittedStates] = useState([]);
  const [contacted, setContacted] = useState([]);
  const propertyData = useSelector((state) => state.property.propertyDetails);
  const [property, setProperty] = useState(propertyData);

  const [error, setError] = useState(null);
  const getPropertyDetails = async (propertyData) => {
    try {
      const response = await fetch(
        `${config.awsApiUrl}/listings/v1/gspmeet?unique_property_id=${propertyData.unique_property_id}`
      );
      const data = await response.json();
      const propertydata = data?.property;
      const decryptedJson = decrypt(propertydata);
      const parsed = decryptedJson ? JSON.parse(decryptedJson) : null;
      const sellerdata = parsed.user;
      if (response?.ok) {
        return sellerdata;
      } else {
        throw new Error("Failed to fetch owner details");
      }
    } catch (err) {
      console.error("err: ", err);
    }
  };
  const fetchContactedProperties = async () => {
    const data = localStorage.getItem("user");
    if (!data) {
      return null;
    }
    const userDetails = JSON.parse(data);
    try {
      const response = await axios.get(
        `${config.awsApiUrl}/enquiry/v1/getUserContactSellers?user_id=${userDetails?.user_id}`
      );
      const contacts = response?.data?.results || response?.data || [];
      const contactIds = Array.isArray(contacts)
        ? contacts.map((contact) => contact.unique_property_id)
        : [];
      setContacted(contactIds);
    } catch (error) {
      console.error("Failed to fetch contacted properties:", error);
    }
  };
  useEffect(() => {
    fetchContactedProperties();
  }, []);
  const handleClose = () => {
    setShowLoginModal(false);
  };
  const formatValue = (value) =>
    value % 1 === 0
      ? parseInt(value)
      : parseFloat(value).toFixed(2).replace(/\.00$/, "");
  const formatToIndianCurrency = (value) => {
    if (!value || isNaN(value)) return "N/A";
    const numValue = parseFloat(value);
    if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
    if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
    if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
    return numValue.toString();
  };
  const { handleAPI } = useWhatsappHook();
  const handleChatClick = async (e) => {
    e.stopPropagation();
    const data = localStorage.getItem("user");
    const userData = data ? JSON.parse(data) : null;
    if (!data) {
      toast?.info?.("Please Login to Schedule Visits!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowLoginModal?.(true);
      return;
    }
    try {
      const sellerData = await getPropertyDetails?.(property);
      const phone = sellerData?.mobile || sellerData?.phone;
      const name = sellerData?.name || "";
      if (phone) {
        const propertyFor = property.property_for === "Rent" ? "rent" : "buy";
        const category =
          property.sub_type === "Apartment" ||
          property.sub_type === "Individual house"
            ? `${property.bedrooms}BHK`
            : property.sub_type === "Plot"
            ? "Plot"
            : "Property";
        const propertyId = property.unique_property_id;
        const slugify = (s) =>
          s
            ?.toLowerCase()
            ?.replace(/[^a-z0-9]+/g, "_")
            ?.replace(/(^-|-$)/g, "");
        const propertyNameSlug = slugify(property.property_name);
        const locationSlug = slugify(property.location_id);
        const citySlug = property.city ? slugify(property.city) : "hyderabad";
        const seoUrl = `${propertyFor}_${category}_${property.sub_type}_${propertyNameSlug}_in_${locationSlug}_${citySlug}_Id_${propertyId}`;
        const fullUrl = `${window.location.origin}/property?${seoUrl}`;
        const encodedMessage = encodeURIComponent(
          `Hi ${name},\nI'm interested in this property: ${property.property_name}.\n${fullUrl}\nPlease reach me at ${userData.mobile}.`
        );
        window.open(
          `https://wa.me/+91${phone}?text=${encodedMessage}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        toast?.error?.("Owner's phone number is not available.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch {
      toast?.error?.("Failed to get owner's contact details.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const handleContactSeller = async () => {
    try {
      const data = localStorage.getItem("user");
      if (!data) {
        toast?.info?.("Please Login to Contact!");
        setShowLoginModal?.(true);
        return;
      }
      const userDetails = JSON.parse(data);
      const payload = {
        unique_property_id: property.unique_property_id,
        user_id: userDetails.user_id || "N/A",
        fullname: userDetails.name || "N/A",
        mobile: property?.user?.mobile,
        email: userDetails.email || "N/A",
      };
      const SubType =
        property.sub_type === "Apartment"
          ? `${property?.sub_type} ${property?.bedrooms}BHK`
          : property?.sub_type;
      const smspayload = {
        name: userDetails?.name || "N/A",
        mobile: userDetails.mobile,
        sub_type: SubType || "N/A",
        location: property?.location_id?.split(/[\s,]+/)[0] || "N/A",
        property_cost: formatToIndianCurrency(property?.property_cost),
        ownerMobile: property?.user?.mobile || "N/A",
      };
      await axios?.post?.(
        `${config.awsApiUrl}/enquiry/v1/sendLeadTextMessage`,
        smspayload
      );
      await axios?.post?.(
        `${config.awsApiUrl}/enquiry/v1/contactSeller`,
        payload
      );
      await handleAPI(property);
      setSubmittedStates((prev) => ({
        ...prev,
        [property.unique_property_id]: {
          ...prev[property?.unique_property_id],
          contact: true,
        },
      }));
      setContacted((prev) => [...prev, property.unique_property_id]);
      toast?.success?.("Enquiry submitted!");
    } catch (err) {
      toast?.error?.("Something went wrong. Please try again.");
    }
  };
  const handleProperty = useCallback(
    (propertyItem) => {
      setProperty(propertyItem);
      dispatch(setPropertyDetails(property));
      const propertyFor =
        propertyItem?.property_for === "Rent" ? "rent" : "buy";
      const slug = (s) =>
        s
          ?.toLowerCase()
          ?.replace(/[^a-z0-9]+/g, "_")
          ?.replace(/(^-|-$)/g, "");
      const seoUrl = `${propertyFor}${propertyItem.sub_type}${slug(
        propertyItem.property_name
      )}in${slug(propertyItem.location_id)}${searchData?.city}_Id_${
        propertyItem.unique_property_id
      }`;
      router.push(`/property?${seoUrl}`, { state: propertyItem });
    },
    [router, dispatch, searchData?.city]
  );
  if (error || !property)
    return <Empty message={error || "Property not found"} />;
  const price =
    property?.property_for === "Rent"
      ? property?.monthly_rent
      : property?.property_cost;
  const getAreaLabelAndValue = (property) => {
    if (property?.sub_type === "Plot") {
      return {
        label: "Plot",
        value: `${formatValue(property?.plot_area)} ${property?.area_units}`,
      };
    } else if (property?.builtup_area) {
      return {
        label: "Built-up",
        value: `${formatValue(property?.builtup_area)} ${property?.area_units}`,
      };
    }
    return {
      label: "Area",
      value: "N/A",
    };
  };
  const { label: areaLabel, value: areaValue } = getAreaLabelAndValue(property);
  const statusText =
    property?.sub_type === "Plot"
      ? property?.possession_status?.toLowerCase() === "immediate"
        ? "Immediate Possession"
        : "Future Possession"
      : property?.occupancy === "Ready to move"
      ? "Ready to Move"
      : property?.occupancy === "Under Construction" &&
        property?.under_construction
      ? `Possession ${new Date(property.under_construction).toLocaleString(
          "default",
          { month: "short", year: "numeric" }
        )}`
      : "Status: N/A";
  return (
    <>
      <div
        style={{ backgroundColor: PropertyAdsColors.secondary.background }}
        className="bg-white/80 sm:mt-7 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
      >
        <div className="p-5 ">
          <div className="flex  ">
            <h1
              style={{ color: PropertyAdsColors.primary.text }}
              className="text-xl sm:text-2xl font-bold text-center sm:leading-7 whitespace-nowrap"
            >
              {property?.property_name}
            </h1>
          </div>
          <div className="mt-1 flex items-center gap-1 sm:whitespace-nowrap text-center text-xs text-gray-600">
            <MapPin color="red" size={15} />
            <span
              style={{ color: PropertyAdsColors.secondary.text }}
              className="truncate text-center"
            >
              {property?.city ? `${property.city}, ` : ""}
              {property?.google_address || property?.location_id}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 px-1 sm:gap-3 md:gap-4">
            <Badge>{property?.sub_type || "Property"}</Badge>
            <div
              style={{ color: PropertyAdsColors.secondary.text }}
              className="text-xs font-medium sm:text-sm"
            >
              All Inclusive Price
            </div>
            {property?.loan_facility === "Yes" && (
              <div
                style={{ color: PropertyAdsColors.primary.text }}
                className="text-xs font-semibold sm:text-sm"
              >
                EMI Available
              </div>
            )}
          </div>
          <p
            style={{ color: PropertyAdsColors.secondary.text }}
            className="mt-3 text-sm flex flex-wrap gap-2 px-1"
          >
            {statusText}{" "}
            {property?.facing ? ` • ${property.facing} Facing` : ""}{" "}
            <span
              style={{ color: PropertyAdsColors.accent.text }}
              className="flex gap-1 items-center font-semibold"
            >
              <MdOutlineVerified color="green" size={18} /> RERA
            </span>
          </p>
          <div className="mt-4 grid sm:grid-cols-2 cursor-pointer gap-3">
            <Stat
              label={
                property?.property_for === "Rent" ? "Monthly Rent" : "Price"
              }
              value={
                <>
                  ₹ {formatToIndianCurrency(property?.property_cost)}
                  {property?.property_cost_type && (
                    <span
                      style={{ color: PropertyAdsColors.primary.text }}
                      className="ml-1 text-xs font-semibold px-1 rounded"
                    >
                      ({property.property_cost_type})
                    </span>
                  )}
                </>
              }
            />
            <Stat
              label={
                property?.sub_type === "Apartment" ? "Configuration" : "Type"
              }
              value={
                property?.sub_type === "Apartment"
                  ? `${property?.bedrooms} BHK`
                  : property?.sub_type || "N/A"
              }
            />
            <Stat label={areaLabel} value={areaValue} />
            <Stat label="Facing" value={property?.facing || "N/A"} />
          </div>
          <div className="px-1 mt-3 ">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              {}
              <span>
                {property?.occupancy === "Under Construction" &&
                  "Under Construction"}
              </span>
              <span>
                {property?.occupancy === "Ready to move"
                  ? "Ready to move"
                  : `${
                      property?.under_construction
                        ? `Possession ${new Date(
                            property.under_construction
                          ).toLocaleString("default", {
                            month: "short",
                            year: "numeric",
                          })}`
                        : "In Progress"
                    }`}
              </span>
            </div>
            <div
              style={{
                backgroundColor:
                  property?.occupancy?.trim().toLowerCase() === "ready to move"
                    ? PropertyAdsColors.progress.fill
                    : PropertyAdsColors.progress.background,
              }}
              className="h-2.5 w-full rounded-full overflow-hidden"
            >
              <div
                className="h-full"
                style={{
                  width:
                    property?.occupancy === "Ready To move" ? "100%" : "40%",
                  backgroundColor:
                    property?.occupancy?.trim().toLowerCase() ===
                    "ready to move"
                      ? PropertyAdsColors.progress.fill
                      : PropertyAdsColors.progress.under_construction,
                }}
              />
            </div>
          </div>
          <div className="py-5 px-1">
            <div className="flex gap-3 text-center justify-center">
              <button
                onClick={handleContactSeller}
                disabled={
                  submittedStates[property?.unique_property_id]?.contact ||
                  contacted?.includes(property.unique_property_id)
                }
                className={`w-full  h-11 rounded-lg text-sm font-semibold   ${
                  submittedStates[property.unique_property_id]?.contact ||
                  contacted.includes(property.unique_property_id)
                    ? "bg-gray-400 text-white border-1 border-cyan-700 cursor-not-allowed"
                    : `${theme.button.secondary.bg} ${theme.button.secondary.text} cursor-pointer hover:opacity-90`
                }
  `}
              >
                {submittedStates[property?.unique_property_id]?.contact ||
                contacted.includes(property.unique_property_id)
                  ? "Submitted"
                  : "Contact Seller"}
              </button>
              <button
                onClick={handleChatClick}
                style={{
                  backgroundColor: PropertyAdsColors.button.chat.background,
                  color: PropertyAdsColors.button.chat.text,
                }}
                className={`w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-[#25D366] text-[#25D366] text-sm font-semibold transition hover:bg-[${PropertyAdsColors.button.chat.hover}]`}
              >
                <Image
                  width={100}
                  height={100}
                  src={whatsappIcon?.src}
                  alt="WhatsApp"
                  className="w-4 h-4"
                />
                <span className="cursor-pointer text-[#25D366]">Chat</span>
              </button>
            </div>
          </div>
        </div>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-xs">
            <div ref={modalRef} className="relative w-[90%] max-w-sm">
              <Login
                setShowLoginModal={setShowLoginModal}
                showLoginModal={showLoginModal}
                onClose={handleClose}
                modalRef={modalRef}
              />
            </div>
          </div>
        )}
      </div>
      <div className="mt-6">
        <PropertyAds handleRender={handleProperty} />
      </div>
    </>
  );
};
export default PropertyDeatils;
