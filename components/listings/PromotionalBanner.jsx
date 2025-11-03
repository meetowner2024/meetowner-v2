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
  FaAngleLeft,
  FaAngleRight,
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
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PropertyModal from "./PropertyModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../utils/config";
import useWhatsappHook from "../utils/useWhatsappHook";
import CryptoJS from "crypto-js";
const STORAGE_KEY = "promoBannerDismissedAt";
const RE_SHOW_AFTER_MS = 4 * 60 * 60 * 1000;
const gradients = [
  {
    bg: "bg-gradient-to-r from-indigo-400 to-blue-600",
    text: "text-indigo-500",
    hover: "hover:from-indigo-500 hover:to-blue-700",
  },
  {
    bg: "bg-gradient-to-r from-teal-400 to-cyan-600",
    text: "text-teal-500",
    hover: "hover:from-teal-500 hover:to-cyan-700",
  },
  {
    bg: "bg-gradient-to-r from-sky-400 to-blue-600",
    text: "text-sky-500",
    hover: "hover:from-sky-500 hover:to-blue-700",
  },
  {
    bg: "bg-gradient-to-r from-slate-400 to-gray-800",
    text: "text-slate-500",
    hover: "hover:from-slate-500 hover:to-gray-900",
  },
  {
    bg: "bg-gradient-to-r from-violet-400 to-indigo-600",
    text: "text-violet-500",
    hover: "hover:from-violet-500 hover:to-indigo-700",
  },
  {
    bg: "bg-gradient-to-r from-blue-400 to-sky-600",
    text: "text-blue-500",
    hover: "hover:from-blue-500 hover:to-sky-700",
  },
  {
    bg: "bg-gradient-to-r from-emerald-400 to-teal-600",
    text: "text-emerald-500",
    hover: "hover:from-emerald-500 hover:to-teal-700",
  },
];
const colors = [
  ["from-indigo-400", "to-blue-600"],
  ["from-teal-400", "to-cyan-600"],
  ["from-sky-400", "to-blue-600"],
  ["from-slate-400", "to-gray-800"],
  ["from-violet-400", "to-indigo-600"],
  ["from-blue-400", "to-sky-600"],
  ["from-emerald-400", "to-teal-600"],
];
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
const getGradient = (index) => gradients[index % gradients.length];
const generateGradient = (index) => {
  const selected = colors[index % colors.length];
  return `bg-gradient-to-r ${selected[0]} ${selected[1]}`;
};
const getFallbackIcon = (name) => {
  const hash = [...name].reduce(
    (acc, c, i) => acc + c.charCodeAt(0) * (i + 1),
    0
  );
  return fallbackIcons[hash % fallbackIcons.length];
};
const PromotionalBanner = ({
  ads,
  showPromoBanner: externalShow,
  setShowPromoBanner: setExternalShow,
  handleNavigation,
}) => {
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
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const swiperPrevRef = useRef(null);
  const swiperNextRef = useRef(null);
  const [images, setImages] = useState([]);
  const bannerRef = useRef(null);
  const cardRef = useRef(null);
  const abortControllerRef = useRef(null);
  const gradient = useMemo(() => getGradient(currentPromo), [currentPromo]);
  const currentProperty = useMemo(() => ads[currentPromo], [ads, currentPromo]);
  const imageUrl = useMemo(
    () =>
      currentProperty?.image
        ? `https://api.meetowner.in/assets/v1/serve/${currentProperty.image}`
        : "https://placehold.co/600x400?text=NotFound",
    [currentProperty]
  );
  const [internalShow, setInternalShow] = useState(true);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    const checkShouldShow = () => {
      if (typeof window === "undefined") return true;
      try {
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (!dismissedAt) return true;
        const elapsed = Date.now() - Number(dismissedAt);
        return elapsed >= RE_SHOW_AFTER_MS;
      } catch {
        return true;
      }
    };
    const shouldShow = checkShouldShow();
    setInternalShow(shouldShow);
    if (setExternalShow && externalShow !== shouldShow) {
      setExternalShow(shouldShow);
    }
  }, [setExternalShow]);
  const showPromoBanner = isClient && internalShow;
  const handleClose = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
    setInternalShow(false);
    setExternalShow?.(false);
  }, [setExternalShow]);
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsExpanded(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 2000);
  }, []);
  const handleViewDetails = useCallback(
    (e) => {
      e.stopPropagation();
      setSelectedProperty(currentProperty);
      setIsModalOpen(true);
    },
    [currentProperty]
  );
  const handleDetailsSectionClick = useCallback(
    (e) => {
      e.stopPropagation();
      setSelectedProperty(currentProperty);
      setIsModalOpen(true);
    },
    [currentProperty]
  );
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
          `https://api.meetowner.in/listings/v1/gspmeet?unique_property_id=${currentProperty.unique_property_id}`
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
            currentProperty.property_for === "Rent" ? "rent" : "sale";
          const bhkPart = currentProperty.bedrooms
            ? `${currentProperty.bedrooms}-bhk-`
            : "";
          const subTypePart = currentProperty.sub_type
            ? `${currentProperty.sub_type.toLowerCase().replace(/\s+/g, "-")}-`
            : "";
          const propertyNameSlug = currentProperty.property_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const builderNameSlug = currentProperty.builder_name
            ? `-by-${currentProperty.builder_name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")}`
            : "";
          const locationSlug = currentProperty.location_id
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const citySlug = currentProperty.city
            ? currentProperty.city
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
            : "hyderabad";
          const forPart = `for-${propertyFor}-`;
          const seoSlug = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
          const propertyId = currentProperty.unique_property_id;
          const fullUrl = `${window.location.origin}/property/${seoSlug}/${propertyId}`;
          const encodedMessage = encodeURIComponent(
            `Hi ${name},\nI'm interested in this property: ${currentProperty.property_name}.\n${fullUrl}\nI look forward to your assistance in the home search. Please get in touch with me at ${userData.mobile} to initiate the process.`
          );
          const whatsappUrl = `https://wa.me/+91${phone}?text=${encodedMessage}`;
          window.open(whatsappUrl, "_blank");
          const SubType =
            currentProperty.sub_type === "Apartment"
              ? `${currentProperty?.sub_type} ${currentProperty?.bedrooms}BHK`
              : currentProperty?.sub_type;
          const smspayload = {
            name: userData?.name,
            mobile: userData?.mobile,
            sub_type: SubType,
            location: currentProperty?.location_id.split(/[\s,]+/)[0],
            property_cost: formatToIndianCurrency(
              currentProperty?.property_cost
            ),
            ownerMobile: phone || "N/A",
          };
          await Promise.all([
            axios.post(
              `${config.awsApiUrl}/enquiry/v1/sendLeadTextMessage`,
              smspayload
            ),
            axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, {
              unique_property_id: currentProperty.unique_property_id,
              user_id: userData.user_id,
              fullname: userData.name,
              mobile: userData.mobile,
              email: userData.email,
            }),
            handleAPI(currentProperty),
          ]);
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
    [currentProperty, handleAPI]
  );
  useEffect(() => {
    if (showPromoBanner && ads.length > 0 && !isExpanded) {
      const interval = setInterval(() => {
        setCurrentPromo((prev) => (prev + 1) % ads.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showPromoBanner, ads, isExpanded]);
  useEffect(() => {
    if (!ads[currentPromo]?.unique_property_id) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${config.awsApiUrl}/property/v1/gpp?unique_property_id=${ads[currentPromo].unique_property_id}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        setImages(data?.images || []);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error fetching property images:", error);
      }
    };
    fetchImages();
    return () => {
      controller.abort();
    };
  }, [currentPromo, ads]);
  useEffect(() => {
    if (isExpanded) {
      const handleClickOutside = (e) => {
        if (bannerRef.current && !bannerRef.current.contains(e.target)) {
          setIsExpanded(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);
  const [swiperInstance, setSwiperInstance] = useState(null);
  useEffect(() => {
    if (swiperInstance && swiperPrevRef.current && swiperNextRef.current) {
      swiperInstance.params.navigation.prevEl = swiperPrevRef.current;
      swiperInstance.params.navigation.nextEl = swiperNextRef.current;
      swiperInstance.navigation.destroy();
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance]);
  const formatToIndianCurrency = useCallback((value) => {
    if (!value || isNaN(value)) return "N/A";
    const numValue = parseFloat(value);
    if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
    if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
    if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
    return numValue.toString();
  }, []);
  const facilitiesList = useMemo(
    () => currentProperty?.facilities?.split(",").map((f) => f.trim()) || [],
    [currentProperty]
  );
  if (!showPromoBanner || ads.length === 0) return null;
  return (
    <div className="hidden lg:block z-[999] mb-1 relative">
      <div
        ref={bannerRef}
        className={`relative px-4 py-1 rounded-lg rounded-t-none ${generateGradient(
          currentPromo
        )} text-white shadow-md transition-all duration-500 cursor-pointer hover:shadow-lg`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-evenly gap-3">
          <div
            className="flex items-center gap-3"
            onClick={handleViewDetails}
            onMouseEnter={handleMouseEnter}
          >
            <div className="flex-shrink-0">
              <div className="w-20 h-15 flex items-center justify-center rounded-md overflow-hidden">
                <Image
                  width={80}
                  height={65}
                  src={imageUrl}
                  alt={currentProperty.property_name}
                  crossOrigin="anonymous"
                  className="object-cover rounded-md"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhfPQAJ/wP/6vR4QQAAAABJRU5ErkJggg=="
                />
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col">
                <h3 className="font-bold text-sm truncate max-w-[180px]">
                  {currentProperty.property_name}
                </h3>
                <p className="text-xs font-bold text-white">
                  ₹{formatToIndianCurrency(currentProperty.property_cost)}
                </p>
              </div>
              <div className="flex flex-col font-semibold">
                <div className="flex items-center gap-1 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">
                    {currentProperty.google_address}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Building className="w-3 h-3" />
                  <span>{currentProperty.property_in}</span>
                  <span>|</span>
                  <span>{currentProperty.property_for}</span>
                  <span>|</span>
                  <span>{currentProperty.furnished_status}</span>
                  <span>|</span>
                  <span>
                    {currentProperty.occupancy === "Under Construction"
                      ? "Under Construction"
                      : "Ready to Move"}
                  </span>
                  <span>|</span>
                  <span>{currentProperty.builtup_area} sqft</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleViewDetails}
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full"
            >
              View Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/10 rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div
            ref={cardRef}
            className="absolute top-full left-0 right-0 z-50 bg-white/95 rounded-xl shadow-2xl overflow-hidden transition-all duration-500 animate-dropDown max-w-6xl mx-auto max-h-[70vh] sm:max-h-[75vh] lg:max-h-[80vh]"
          >
            <div className="flex flex-col md:flex-row h-full">
              <div
                className="w-full md:w-1/2 p-2 bg-gradient-to-br from-teal-50 to-cyan-50 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    prevEl: swiperPrevRef.current,
                    nextEl: swiperNextRef.current,
                  }}
                  onSwiper={setSwiperInstance}
                  pagination={{
                    clickable: true,
                    el: ".swiper-pagination-custom",
                  }}
                  slidesPerView={1}
                  spaceBetween={0}
                  className="w-full rounded-lg overflow-hidden"
                  style={{ height: "100%" }}
                >
                  {images.length > 0 ? (
                    images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className="relative w-full h-full">
                          <Image
                            fill
                            src={
                              img.url ||
                              "https://placehold.co/400x300?text=NotFound"
                            }
                            alt={`Property Image ${index + 1}`}
                            className="object-cover"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhfPQAJ/wP/6vR4QQAAAABJRU5ErkJggg=="
                            quality={80}
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/400x300?text=NotFound";
                            }}
                          />
                        </div>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <div className="relative w-full h-full">
                        <Image
                          fill
                          src="https://placehold.co/400x300?text=No+Images"
                          alt="No Images"
                          className="object-cover"
                          loading="lazy"
                          unoptimized
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhfPQAJ/wP/6vR4QQAAAABJRU5ErkJggg=="
                          quality={80}
                        />
                      </div>
                    </SwiperSlide>
                  )}
                  <button
                    ref={swiperPrevRef}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 p-1 bg-white/80 rounded-full text-gray-600 hover:bg-white hover:text-gray-800 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      swiperInstance?.slidePrev();
                    }}
                  >
                    <FaAngleLeft className="w-full h-full" />
                  </button>
                  <button
                    ref={swiperNextRef}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 p-1 bg-white/80 rounded-full text-gray-600 hover:bg-white hover:text-gray-800 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      swiperInstance?.slideNext();
                    }}
                  >
                    <FaAngleRight className="w-full h-full" />
                  </button>
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <div className="swiper-pagination-custom"></div>
                  </div>
                </Swiper>
              </div>
              <div
                className="w-full md:w-1/2 p-4 overflow-y-auto cursor-pointer"
                onClick={handleDetailsSectionClick}
              >
                <h3 className={`text-lg font-bold ${gradient.text} mb-2`}>
                  {currentProperty.property_name}
                </h3>
                <p className={`text-md font-bold ${gradient.text} mb-3`}>
                  ₹{formatToIndianCurrency(currentProperty.property_cost)}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className={`w-4 h-4 ${gradient.text}`} />
                  <span className="truncate">
                    {currentProperty.google_address}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Building className={`w-4 h-4 ${gradient.text}`} />
                    <span className="text-sm text-gray-700">
                      {currentProperty.property_in} |{" "}
                      {currentProperty.property_for}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className={`w-4 h-4 ${gradient.text}`} />
                    <span className="text-sm text-gray-700">
                      {currentProperty.furnished_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${gradient.text}`} />
                    <span className="text-sm text-gray-700">
                      {currentProperty.occupancy === "Under Construction"
                        ? "Under Construction"
                        : "Ready to Move"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className={`w-4 h-4 ${gradient.text}`} />
                    <span className="text-sm text-gray-700">
                      {currentProperty.builtup_area} sqft
                    </span>
                  </div>
                  {currentProperty.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className={`w-4 h-4 ${gradient.text}`} />
                      <span className="text-sm text-gray-700">
                        {currentProperty.bedrooms} Bedrooms
                      </span>
                    </div>
                  )}
                  {currentProperty.bathroom && (
                    <div className="flex items-center gap-2">
                      <Bath className={`w-4 h-4 ${gradient.text}`} />
                      <span className="text-sm text-gray-700">
                        {currentProperty.bathroom} Bathrooms
                      </span>
                    </div>
                  )}
                </div>
                {facilitiesList.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-slate-900 mb-2 relative">
                      Amenities
                      <svg
                        viewBox="0 0 120 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute -bottom-1 left-0 w-20 h-2"
                      >
                        <path
                          d="M2 6 C20 14, 50 -6, 118 6"
                          stroke="#F0AA00"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {facilitiesList.slice(0, 8).map((facility, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <div className={`${gradient.text} flex items-center`}>
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
                  className={`w-full ${gradient.bg} ${gradient.hover} text-white font-semibold py-2 px-4 rounded-full transition-all duration-300`}
                >
                  Contact Seller
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/20 rounded-full blur-3xl -z-10" />
          </div>
        )}
      </div>
      {isModalOpen && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setIsModalOpen(false)}
          handleNavigation={handleNavigation}
        />
      )}
    </div>
  );
};
export default React.memo(PromotionalBanner);
