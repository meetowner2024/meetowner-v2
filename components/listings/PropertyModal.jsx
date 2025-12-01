import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Building,
  Droplet,
  Dumbbell,
  Landmark,
  Medal,
  MonitorCheck,
  PawPrint,
  Phone,
  ShieldCheck,
  Palmtree as TreePalm,
  Users,
  Waves,
  Bed,
  Bath,
  Home,
  Calendar,
  X,
  MapPin,
} from "lucide-react";
import {
  FaDoorOpen,
  FaBasketballBall,
  FaCogs,
  FaShieldAlt,
  FaBatteryFull,
  FaSpaceShuttle,
  FaChild,
  FaWater,
  FaFilter,
  FaSolarPanel,
  FaLeaf,
  FaPlug,
  FaWifi,
  FaBicycle,
  FaFireExtinguisher,
  FaToolbox,
} from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../utils/config";
import useWhatsappHook from "../utils/useWhatsappHook";
import CryptoJS from "crypto-js";
const facilityIconMap = {
  Lift: <Building />,
  CCTV: <MonitorCheck />,
  Gym: <Dumbbell />,
  Garden: <TreePalm />,
  "Club House": <Users />,
  Sports: <Medal />,
  "Swimming Pool": <Waves />,
  Intercom: <Phone />,
  "Gated Community": <ShieldCheck />,
  "Regular Water": <Droplet />,
  "Community Hall": <Landmark />,
  "Pet Allowed": <PawPrint />,
  "Half Basket Ball Court": <FaBasketballBall />,
  "Power Backup": <FaBatteryFull />,
  "Entry / Exit": <FaDoorOpen />,
  "Badminton Court": <FaSpaceShuttle />,
  "Children Play Area": <FaChild />,
  "Water Harvesting Pit": <FaWater />,
  "Water Softener": <FaFilter />,
  "Solar Fencing": <FaSolarPanel />,
  "Security Cabin": <FaShieldAlt />,
  Lawn: <FaLeaf />,
  "Transformer Yard": <FaPlug />,
};
const fallbackIcons = [
  <FaWifi />,
  <FaBicycle />,
  <FaFireExtinguisher />,
  <FaToolbox />,
  <FaCogs />,
  <FaWater />,
  <FaSolarPanel />,
  <FaShieldAlt />,
];
const getFallbackIcon = (name) => {
  const hash = [...name].reduce(
    (acc, c, i) => acc + c.charCodeAt(0) * (i + 1),
    0
  );
  return fallbackIcons[hash % fallbackIcons?.length];
};
const PropertyModal = React.memo(
  ({ property, onClose, handleNavigation }) => {
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
    const { handleAPI } = useWhatsappHook();
    const [state, setState] = useState({
      images: [],
      selectedImageIndex: 0,
    });
    const modalRef = useRef(null);
    const formatToIndianCurrency = useCallback((value) => {
      if (!value || isNaN(value)) return "N/A";
      const numValue = parseFloat(value);
      if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
      if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
      if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
      return numValue.toString();
    }, []);
    useEffect(() => {
      let isMounted = true;
      const fetchImages = async () => {
        try {
          const response = await fetch(
            `https://api.meetowner.in/property/getpropertyphotos?unique_property_id=${property.unique_property_id}`
          );
          const data = await response.json();
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              images: data?.images || [],
              selectedImageIndex: 0,
            }));
          }
        } catch (error) {
          console.error("Error fetching property images:", error);
          if (isMounted) toast.error("Failed to load property images");
        }
      };
      fetchImages();
      return () => {
        isMounted = false;
      };
    }, [property.unique_property_id]);
    useEffect(() => {
      document.body.style.overflow = "hidden";
      const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.body.style.overflow = "auto";
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [onClose]);
    const handleChatClick = useCallback(
      async (e) => {
        e.stopPropagation();
        const data = localStorage.getItem("user");
        if (!data) {
          toast.info("Please Login to Contact!", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        const userData = JSON.parse(data);
        try {
          const response = await fetch(
            `https://api.meetowner.in/listings/v1/gspmeet?unique_property_id=${property.unique_property_id}`
          );
          const data = await response.json();
          const propertydata = data?.property;
          const decryptedJson = decrypt(propertydata);
          const parsed = decryptedJson ? JSON.parse(decryptedJson) : null;
          const sellerdata = parsed.user;
          const phone = sellerdata?.mobile || sellerdata?.phone;
          const name = sellerdata?.name || "";
          if (phone) {
            const propertyFor =
              property.property_for === "Rent" ? "rent" : "sale";
            const propertyId = property.unique_property_id;
            const bhkPart = property.bedrooms
              ? `${property.bedrooms}-bhk-`
              : "";
            const subTypePart = property.sub_type
              ? `${property.sub_type.toLowerCase().replace(/\s+/g, "-")}-`
              : "";
            const propertyNameSlug = property.property_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            const builderNameSlug = property.builder_name
              ? `-by-${property.builder_name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")}`
              : "";
            const locationSlug = property.location_id
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            const citySlug = property.city
              ? property.city
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")
              : "hyderabad";
            const forPart = `for-${propertyFor}-`;
            const seoSlug = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
            const fullUrl = `${window.location.origin}/property/${seoSlug}/${propertyId}`;
            const encodedMessage = encodeURIComponent(
              `Hi ${name},\nI'm interested in this property: ${property.property_name}.\n${fullUrl}\nPlease get in touch with me at ${userData.mobile}.`
            );
            window.open(
              `https://wa.me/+91${phone}?text=${encodedMessage}`,
              "_blank"
            );
            await axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, {
              unique_property_id: property.unique_property_id,
              user_id: userData.user_id,
              fullname: userData.name,
              mobile: userData.mobile,
              email: userData.email,
            });
            await handleAPI(property);
          } else {
            toast.error("Owner's phone number is not available.", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } catch (error) {
          toast.error("Failed to get owner's contact details.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      },
      [property, handleAPI]
    );
    const handleThumbnailClick = useCallback((index) => {
      setState((prev) => ({ ...prev, selectedImageIndex: index }));
    }, []);
    const facilitiesList = useMemo(
      () => property?.facilities?.split(",").map((f) => f.trim()) || [],
      [property.facilities]
    );
    const visibleThumbnails = useMemo(() => {
      const start = Math.max(0, state.selectedImageIndex - 2);
      const end = Math.min(start + 5, state.images?.length);
      return state.images.slice(start, end);
    }, [state.selectedImageIndex, state.images]);
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60">
        <div
          ref={modalRef}
          className="relative w-full max-w-5xl bg-white/95 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 max-h-screen overflow-y-auto scrollbar-hidden flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-3 z-10 text-gray-600 hover:text-gray-800 p-2 rounded-full bg-white/80 hover:bg-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 flex flex-col bg-gradient-to-br from-teal-50 to-cyan-50">
              <div className="flex-1 flex items-center justify-center p-4">
                <Image
                  width={1000}
                  height={1000}
                  quality={100}
                  src={
                    state.images[state.selectedImageIndex]?.url ||
                    "https://placehold.co/600x400?text=NotFound&format=png"
                  }
                  alt="Main Property"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
              <div className="h-40 overflow-x-auto scrollbar-hidden flex space-x-2 px-4 pb-1">
                {visibleThumbnails.map((img, index) => {
                  const trueIndex =
                    index + Math.max(0, state.selectedImageIndex - 2);
                  return (
                    <div
                      key={trueIndex}
                      className={`w-28 h-30 rounded-md overflow-hidden cursor-pointer ${
                        state.selectedImageIndex === trueIndex
                          ? "border-2 border-teal-500"
                          : ""
                      }`}
                      onClick={() => handleThumbnailClick(trueIndex)}
                    >
                      <Image
                        width={1000}
                        height={1000}
                        quality={90}
                        src={
                          img.url || "https://placehold.co/96x96?text=NotFound"
                        }
                        alt={`Thumbnail ${trueIndex + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className="w-full md:w-1/2 p-6 bg-white/90 overflow-y-auto scrollbar-hidden max-h-[85vh]"
              onClick={() => handleNavigation(property)}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {property.property_name}
                </h2>
              </div>
              <p className="text-md font-bold text-teal-500 mb-4">
                ₹{formatToIndianCurrency(property.property_cost)}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="truncate">{property.google_address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-500" />
                  <span>
                    {property.property_in} | {property.property_for}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-orange-500" />
                  <span>{property.furnished_status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>
                    {property.occupancy === "Under Construction"
                      ? "Under Construction"
                      : "Ready to Move"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-orange-500" />
                  <span>{property.builtup_area} sqft</span>
                </div>
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-orange-500" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathroom && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4 text-orange-500" />
                    <span>{property.bathroom} Bathrooms</span>
                  </div>
                )}
              </div>
              {facilitiesList?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {facilitiesList?.slice(0, 10).map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="text-teal-500">
                          {facilityIconMap[facility] ||
                            getFallbackIcon(facility)}
                        </div>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={handleChatClick}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.property.unique_property_id ===
    nextProps.property.unique_property_id
);
export default PropertyModal;
