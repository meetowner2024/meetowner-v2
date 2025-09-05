"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaParking, FaBed, FaBath } from "react-icons/fa";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { IoShareSocialOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useDispatch, useSelector } from "react-redux";
import { setSearchData } from "../store/slices/searchSlice";
import config from "../utils/config";
import axios from "axios";
import { toast } from "react-toastify";
import Login from "../auth/Login";
import useWhatsappHook from "../utils/useWhatsappHook";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import Image from "next/image";
import Link from "next/link";
import theme from "../utils/theme.json";
const PropertyListing = ({ latestProperties, favourites }) => {
  const searchData = useSelector((state) => state.search);
  const [activeTab, setActiveTab] = useState("Latest");
  const [property, setProperty] = useState(latestProperties || []);
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/listings");
  }, [router]);
  const [likedProperties, setLikedProperties] = useState([]);
  const isHomePageMode = [
    "latest",
    "sell",
    "rent",
    "buy",
    "plot",
    "commercial",
  ].includes(searchData.tab?.toLowerCase());
  useEffect(() => {
    if (["Buy", "Plot", "Commercial"].includes(searchData.tab)) {
      setActiveTab("Latest");
    } else if (["Rent", "Sell"].includes(searchData.tab)) {
      setActiveTab(searchData.tab);
    }
  }, [searchData.tab]);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "N/A";
    if (price >= 10000000) {
      return (price / 10000000).toFixed(2) + " Cr";
    } else if (price >= 100000) {
      return (price / 100000).toFixed(2) + " L";
    }
    return price.toLocaleString();
  };
  const [loading, setLoading] = useState(false);
  const fetchLatestProperties = useCallback(async () => {
    setLoading(true);
    setProperty([]);
    try {
      const propertyFor =
        activeTab === "Latest" || activeTab === "Sell" ? "Sell" : "Rent";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(
        `/api/getLatestProperties?property_for=${propertyFor}`,
        {
          cache: "force-cache",
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }
      const data = await response.json();
      setProperty(data.properties || []);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      toast.error("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);
  useEffect(() => {
    if (!latestProperties.length || activeTab !== "Latest") {
      fetchLatestProperties();
    } else {
      setProperty(latestProperties);
    }
  }, [activeTab, latestProperties, fetchLatestProperties]);
  useEffect(() => {
    const liked = favourites;
    if (liked && Array.isArray(liked)) {
      const likedIds = liked.map((fav) => fav.unique_property_id);
      setLikedProperties(likedIds);
    }
  }, []);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!isHomePageMode) return;
    const property_for =
      activeTab === "Latest" || activeTab === "Sell" ? "Sell" : "Rent";
    dispatch(
      setSearchData({
        tab: activeTab,
        property_for: property_for,
      })
    );
  }, [activeTab, dispatch, isHomePageMode]);
  const { handleAPI } = useWhatsappHook();
  const handleEnquireNow = async (property) => {
    try {
      const data = localStorage.getItem("user");
      if (!data) {
        toast.info("Please Login to Enquire Property!", {
          position: "top-right",
          autoClose: 3000,
        });
        setShowLoginModal(true);
        return;
      }
      const userDetails = JSON.parse(data);
      const payload = {
        property_id: property.unique_property_id,
        user_id: userDetails.user_id,
        name: userDetails.name,
        mobile: userDetails.mobile,
        email: userDetails.email,
        interested_status: 4,
        property_user_id: property.user_id,
      };
      const payload1 = {
        unique_property_id: property.unique_property_id,
        user_id: userDetails.user_id,
        fullname: userDetails.name,
        mobile: userDetails.mobile,
        email: userDetails.email,
      };
      await axios.post(
        `${config.awsApiUrl}/enquiry/v1/contactSeller`,
        payload1
      );
      await axios.post(`${config.awsApiUrl}/enquiry/v1/postEnquiry`, payload);
      await handleAPI(property);
    } catch (err) {
      console.error("Enquiry Failed:", err);
      alert("Something went wrong while submitting enquiry");
    }
  };
  const handleLike = async (property) => {
    const data = localStorage.getItem("user");
    if (!data) {
      toast.info("Please Login to Save Property!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const userDetails = JSON.parse(data);
    const isAlreadyLiked = likedProperties.includes(
      property.unique_property_id
    );
    setLikedProperties((prev) =>
      isAlreadyLiked
        ? prev.filter((id) => id !== property.unique_property_id)
        : [...prev, property.unique_property_id]
    );
    const payload = {
      user_id: userDetails.user_id,
      unique_property_id: property.unique_property_id,
      property_name: property.property_name,
    };
    try {
      await axios.post(`${config.awsApiUrl}/fav/v1/postIntrest`, payload);
    } catch (err) {
      console.error("Error updating interest:", err);
    }
  };
  const [showLoginModal, setShowLoginModal] = useState(false);
  const modalRef = useRef(null);
  const handleClose = () => {
    setShowLoginModal(false);
  };
  const handleNavigation = useCallback(
    async (property) => {
      let userDetails = null;
      try {
        const data = localStorage.getItem("user");
        if (data) {
          const parsedData = JSON.parse(data);
          userDetails = parsedData || null;
        }
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
        userDetails = null;
      }
      if (userDetails?.user_id) {
        const viewData = {
          user_id: userDetails.user_id,
          property_id: property?.unique_property_id || "N/A",
          name: userDetails?.name || "N/A",
          mobile: userDetails?.mobile || "N/A",
          email: userDetails?.email || "N/A",
          property_name: property?.property_name || "N/A",
        };
        try {
          await axios.post(
            `${config.awsApiUrl}/listings/v1/propertyViewed`,
            viewData
          );
        } catch (error) {
          console.error("Failed to record property view:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
        }
      }
      dispatch(
        setPropertyDetails({
          property,
        })
      );
      const propertyFor = property?.property_for === "Rent" ? "rent" : "buy";
      const propertyId = property.unique_property_id;
      const propertyNameSlug = property.property_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^-|-$)/g, "");
      const locationSlug = property.location_id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^-|-$)/g, "");
      const seoUrl = `${propertyFor}_${property.sub_type}_${propertyNameSlug}_in_${locationSlug}_${searchData?.city}_Id_${propertyId}`;
      router.push(`/property?${seoUrl}`, { state: property });
    },
    [router, dispatch, searchData]
  );
  const buildListingsUrl = () => {
    const propertyFor = searchData?.tab === "Rent" ? "rent" : "sale";
    const propertyType = (() => {
      switch (searchData?.sub_type) {
        case "Plot":
          return "plots";
        case "Commercial":
          return "commercial-properties";
        default:
          return "apartments";
      }
    })();
    const citySlug = searchData.location
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");
    const locationSlug = searchData.city
      ? searchData.city
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)/g, "")
      : "";
    return `/listings?${propertyType}_for_${propertyFor}_in_${citySlug}${
      locationSlug ? `_${locationSlug}` : ""
    }`;
  };
  const handleShare = (property) => {
    const propertyFor = property?.property_for === "Rent" ? "rent" : "buy";
    const propertyId = property.unique_property_id;
    const propertyNameSlug = property.property_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^-|-$)/g, "");
    const locationSlug = property.location_id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^-|-$)/g, "");
    const seoUrl = `/property?${propertyFor}_${property.sub_type}_${propertyNameSlug}_in_${locationSlug}_${searchData?.city}_Id_${propertyId}`;
    const shareData = {
      title: `${property.property_name} - ${property.location_id}`,
      text: `Check out this ${property.bedrooms || ""} BHK ${
        property.property_type
      } for ${propertyFor} in ${property.location_id}! Price: ₹${
        propertyFor === "rent"
          ? formatPrice(property.monthly_rent)
          : formatPrice(property.property_cost)
      }${propertyFor === "rent" ? " / month" : ""}.`,
      url: seoUrl,
    };
    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((error) => console.error("Error sharing property:", error));
    } else {
      navigator.clipboard
        .writeText(seoUrl)
        .then(() => {
          alert(
            "Property link copied to clipboard! You can paste it to share."
          );
        })
        .catch((error) => {
          console.error("Error copying link:", error);
          alert("Failed to copy link. Please copy this URL: " + seoUrl);
        });
    }
  };
  return (
    <div className=" z-auto mx-auto px-4 py-1">
      <div className="mb-8">
        <div ref={ref} className="overflow-hidden">
          <div ref={ref} className="overflow-hidden">
            <h2
              className={`text-3xl font-bold text-gray-900 text-left flex flex-col
          ${visible ? "animate-rise" : "opacity-0 translate-y-10"}`}
            >
              <span>Latest Properties</span>
              <svg
                viewBox="0 0 120 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-48 h-4 mt-2 transition-all duration-1000
            ${visible ? "animate-rise delay-200" : "opacity-0 translate-y-10"}`}
              >
                <path
                  d="M2 6 C20 14, 50 -6, 118 6"
                  stroke="#FFD700"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`${visible ? "draw-line" : ""}`}
                />
              </svg>
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab("Latest")}
              className={`px-6 py-1 rounded-full border cursor-pointer border-black ${
                activeTab === "Latest"
                  ? `${theme.button.secondary.bg}  border-none ${theme.button.secondary.text} `
                  : "bg-white text-black"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setActiveTab("Sell")}
              className={`px-6 py-1 rounded-full border cursor-pointer border-black ${
                activeTab === "Sell"
                  ? `${theme.button.secondary.bg}  border-none ${theme.button.secondary.text} `
                  : "bg-white text-black"
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => setActiveTab("Rent")}
              className={`px-6 py-1 rounded-full border cursor-pointer border-black ${
                activeTab === "Rent"
                  ? `${theme.button.secondary.bg} border-none ${theme.button.secondary.text} `
                  : "bg-white text-black"
              }`}
            >
              Rent
            </button>
          </div>
          <div>
            <Link
              href={buildListingsUrl()}
              prefetch={true}
              onMouseEnter={() => router.prefetch("/listings")}
              className="text-[#1D3A76] cursor-pointer underline hover:text-yellow-500 font-small flex items-center"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb-10 overflow-hidden h-[550px] lg:h-[500px]"
      >
        {loading ? (
          <div className="text-center py-10 text-[#1D3A76] font-semibold">
            Loading properties...
          </div>
        ) : property.length > 0 ? (
          property.map((property) => (
            <SwiperSlide key={property.unique_property_id}>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={
                      property.image
                        ? `https://api.meetowner.in/assets/v1/serve/${property.image}`
                        : `https://placehold.co/600x400?text=${
                            property?.property_name || "No Image Found"
                          }`
                    }
                    alt={property?.property_name || "Property"}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x400?text=${
                        property?.property_name || "No Image Found"
                      }`;
                    }}
                    priority={true}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#F0AA00] text-black px-3 py-1 rounded-full text-sm">
                      For {""}
                      {property.property_for === "Sell"
                        ? "Sale"
                        : property.property_for}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {likedProperties.includes(property.unique_property_id) ? (
                      <IoIosHeart
                        onClick={() => handleLike(property)}
                        className="p-1 w-7 h-7 bg-white rounded-2xl text-red-600 cursor-pointer"
                      />
                    ) : (
                      <IoIosHeartEmpty
                        onClick={() => handleLike(property)}
                        className="p-1 w-7 h-7 bg-white rounded-2xl text-red-600 hover:text-red-500 cursor-pointer"
                      />
                    )}
                    <IoShareSocialOutline
                      onClick={() => handleShare(property)}
                      className="p-1 w-7 h-7 bg-white rounded-2xl text-black hover:text-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaMapMarkerAlt className="mr-2 text-gray-500" />
                    <span>{property.location_id}</span>
                  </div>
                  <h3
                    className="text-xl font-bold text-[#1D3A76] text-left  mb-2"
                    onClick={() => handleNavigation(property)}
                  >
                    {property.property_name}
                  </h3>
                  <div
                    className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-700"
                    onClick={() => handleNavigation(property)}
                  >
                    {property?.bedrooms > 0 && (
                      <div className="flex items-center">
                        <FaBed className="mr-2" /> {property.bedrooms} Beds
                      </div>
                    )}
                    {property?.bathroom > 0 && (
                      <div className="flex items-center">
                        <FaBath className="mr-2" /> {property.bathroom} Baths
                      </div>
                    )}
                    {property?.car_parking > 0 && (
                      <div className="flex items-center">
                        <FaParking className="mr-2" /> {property.car_parking}{" "}
                        Car Parking
                      </div>
                    )}
                    {property?.bike_parking > 0 && (
                      <div className="flex items-center">
                        <FaParking className="mr-2" /> {property.bike_parking}{" "}
                        Bike Parking
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-lg font-bold text-[#1D3A76]">
                      ₹{" "}
                      {formatPrice(
                        activeTab === "Rent"
                          ? property?.monthly_rent
                          : property.property_cost
                      )}
                      {activeTab === "Rent" && property?.monthly_rent
                        ? " / month"
                        : ""}
                    </div>
                    <button
                      onClick={() => handleEnquireNow(property)}
                      className={`${theme.button.secondary.bg} ${theme.button.secondary.text} px-6 py-2 rounded-full ${theme.button.secondary.hover} ${theme.button.secondary.hoverText}`}
                    >
                      Enquire Now
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No properties found.
          </div>
        )}
        <div className="swiper-pagination-custom flex justify-center"></div>
        <style jsx>{`
          .swiper-pagination-custom {
            display: flex;
            align-items: center;
          }
          .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background: #d1d5db;
            opacity: 0.7;
            margin: 0 6px;
            border-radius: 50%;
          }
          .swiper-pagination-bullet-active {
            background: #1d3a76;
            opacity: 1;
          }
        `}</style>
      </Swiper>
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
  );
};
export default PropertyListing;
