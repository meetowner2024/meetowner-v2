import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  FaAngleLeft,
  FaAngleRight,
  FaDownload,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import { CreditCard, Gift, Sparkles, Tag, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import config from "../../../config";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
const PropertyDetails = ({
  mainFloorPlan,
  property,
  mainImage,
  loading,
  error,
  setMainFloorPlan,
  setMainImage,
}) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };
  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUserDetails(JSON.parse(data));
    }
  }, []);
  const formatDistance = (distance) => {
    const d = parseFloat(distance);
    if (isNaN(d)) return distance;
    return d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${d} m`;
  };
  const getPlaceIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("school")) return <i className="fas fa-school"></i>;
    if (lowerTitle.includes("hospital"))
      return <i className="fas fa-hospital"></i>;
    if (lowerTitle.includes("mall") || lowerTitle.includes("store"))
      return <i className="fas fa-shopping-cart"></i>;
    if (lowerTitle.includes("stadium"))
      return <i className="fas fa-football-ball"></i>;
    if (lowerTitle.includes("park")) return <i className="fas fa-tree"></i>;
    if (lowerTitle.includes("beach")) return <i className="fas fa-water"></i>;
    if (lowerTitle.includes("highway")) return <i className="fas fa-road"></i>;
    return <i className="fas fa-map-marker-alt"></i>;
  };
  const formatToIndianCurrency = (value) => {
    if (!value || isNaN(value)) return "N/A";
    const numValue = parseFloat(value);
    if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
    if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
    if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
    return numValue.toString();
  };
  const getOtpOptionIcon = (option) => {
    switch (option.toLowerCase()) {
      case "regular":
        return <Tag className="w-4 h-4" />;
      case "otp":
        return <CreditCard className="w-4 h-4" />;
      case "offers":
        return <Gift className="w-4 h-4" />;
      case "emi":
        return <Zap className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };
  const getDocumentUrl = (path) => {
    return `https://api.meetowner.in/assets/v1/serve/${path}`;
  };
  const openDocumentInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const handleAPI = async (property) => {
    try {
      const payload = {
        name: userDetails?.name,
        mobile: userDetails?.mobile,
        ownerName: property?.builder_name,
        ownerMobile: property?.owner_mobile,
        property_name: property?.property_name,
        sub_type: property?.sub_type,
        google_address: `${property.city},${property?.location}`,
      };
      const response = await axios.post(
        `${config.awsApiUrl}/auth/v1/sendWhatsappLeads`,
        payload
      );
      if (response.status === 200) {
        toast.success("Details Submitted Successfully!");
      }
    } catch (error) {
      console.error("Backend error:", error.response?.data || error.message);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-lg font-medium text-indigo-600">
          Loading property details...
        </p>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Error loading property</p>
          <p>{"Property not found"}</p>
        </div>
        <button
          aria-label="Go Back"
          onClick={() => window.history.back()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-full mt-4 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full bg-white rounded-xl shadow-md space-y-2">
      <h1 className="text-blue-900 font-bold text-center text-xl sm:text-2xl lg:text-3xl uppercase">
        {property.property_name} Property Details
      </h1>

      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl text-left font-semibold text-gray-800">
          Property Description
        </h2>
        <p className="text-sm sm:text-base text-left text-gray-600">
          {property?.description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row text-left sm:justify-between gap-4">
        <div>
          <p className="text-sm sm:text-base font-medium text-gray-600">
            {property.location}, {property.city}, {property.state}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {property.sub_type} for {property.property_for} |{" "}
            {property.possession_status} | Possession by{" "}
            {formatDate(property.possession_end_date)}
          </p>
        </div>
        <p className="text-base sm:text-lg font-bold text-blue-900">
          ₹{formatToIndianCurrency(property.property_cost_from)} – ₹
          {formatToIndianCurrency(property.property_cost_upto)}
          <span className="text-gray-500 text-sm font-medium">
            {" "}
            (Prices may change)
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {property.otp_options &&
          property.otp_options.map((option, index) => (
            <span
              key={index}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:bg-indigo-100 transition"
            >
              {getOtpOptionIcon(option)}
              {option}
            </span>
          ))}
        {property.is_rera_registered === 1 && (
          <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:bg-indigo-100 transition">
            <MdOutlineVerified className="text-base sm:text-lg text-indigo-600" />
            RERA Registered
          </span>
        )}
        {property.launch_type && (
          <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:bg-indigo-100 transition">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            {property.launch_type}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-start sm:justify-end">
        {property.brochure && (
          <button
            aria-label="Brochure"
            onClick={() =>
              openDocumentInNewTab(getDocumentUrl(property.brochure))
            }
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 cursor-pointer text-white font-medium py-2 px-4 rounded-full text-sm transition"
          >
            <FaDownload />
            Brochure
          </button>
        )}
        {property.price_sheet && (
          <button
            aria-label="Price Sheet"
            onClick={() =>
              openDocumentInNewTab(getDocumentUrl(property.price_sheet))
            }
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 cursor-pointer text-white font-medium py-2 px-4 rounded-full text-sm transition"
          >
            <FaDownload />
            Price Sheet
          </button>
        )}
        <button
          aria-label="Chat"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 cursor-pointer text-white font-medium py-2 px-4 rounded-full text-sm transition"
          onClick={() => handleAPI(property)}
        >
          <FaWhatsapp />
          Chat
        </button>
      </div>

      <div className="border-t pt-3">
        <Image
          
          width={600}
          height={400}
          src={`https://api.meetowner.in/assets/v1/serve/${mainImage}`}
          alt="Property Image"
          crossOrigin="anonymous"
          className="w-full h-auto max-h-[400px] sm:max-h-[500px] object-cover rounded-xl shadow-md"
          onError={(e) => {
            e.target.src = `https://placehold.co/600x400?text=${property.property_name}`;
          }}
        />
        {property.gallery_images.length > 1 && (
          <div className="mt-4">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: ".swiper-button-next-custom-gallery",
                prevEl: ".swiper-button-prev-custom-gallery",
              }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination-custom-gallery",
              }}
              slidesPerView={2}
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              spaceBetween={12}
              className="mySwiper"
            >
              {property.gallery_images.map((img) => (
                <SwiperSlide key={img.id}>
                  <Image
                    
                    width={150}
                    height={150}
                    src={`https://api.meetowner.in/assets/v1/serve/${img.image}`}
                    alt={`Thumbnail ${img.id}`}
                    crossOrigin="anonymous"
                    className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                    onClick={() => setMainImage(img.image)}
                    onError={(e) => {
                      e.target.src = `https://placehold.co/150x150?text=Image`;
                    }}
                  />
                </SwiperSlide>
              ))}
              <div className="flex justify-center items-center gap-4 mt-4">
                <button aria-label="Previous" className="swiper-button-prev-custom-gallery">
                  <FaAngleLeft className="w-6 h-6 p-1 border border-gray-300 rounded-full hover:bg-gray-100" />
                </button>
                <div className="swiper-pagination-custom-gallery flex justify-center"></div>
                <button aria-label="Next" className="swiper-button-next-custom-gallery">
                  <FaAngleRight className="w-6 h-6 p-1 border border-gray-300 rounded-full hover:bg-gray-100" />
                </button>
              </div>
            </Swiper>
          </div>
        )}
      </div>

      {property.sizes.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl text-left font-semibold text-indigo-800 mb-3">
            Floor Plans
          </h2>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition">
            <Image
              
              width={600}
              height={400}
              src={`https://api.meetowner.in/assets/v1/serve/${mainFloorPlan}`}
              alt="Floor Plan"
              crossOrigin="anonymous"
              className="w-full h-auto max-h-[400px] sm:max-h-[500px] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = `https://placehold.co/600x400?text=No Floor Plan Found`;
              }}
            />
            {property.sizes.length > 1 && (
              <div className="mt-4">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    nextEl: ".swiper-button-next-custom-floorplan",
                    prevEl: ".swiper-button-prev-custom-floorplan",
                  }}
                  pagination={{
                    clickable: true,
                    el: ".swiper-pagination-custom-floorplan",
                  }}
                  slidesPerView={2}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                  }}
                  spaceBetween={12}
                  className="mySwiper"
                >
                  {property.sizes.map((size) => (
                    <SwiperSlide key={size.size_id}>
                      <Image
                        
                        width={150}
                        height={150}
                        src={`https://api.meetowner.in/assets/v1/serve/${size.floor_plan}`}
                        alt={`Floor Plan ${size.size_id}`}
                        crossOrigin="anonymous"
                        className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                        onClick={() => setMainFloorPlan(size.floor_plan)}
                        onError={(e) => {
                          e.target.src = `https://placehold.co/150x150?text=Floor Plan`;
                        }}
                      />
                      <p className="text-xs text-center mt-2">
                        {size.buildup_area} Sq.ft
                      </p>
                    </SwiperSlide>
                  ))}
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <button aria-label="Previous" className="swiper-button-prev-custom-floorplan">
                      <FaAngleLeft className="w-6 h-6 p-1 border border-gray-300 rounded-full hover:bg-gray-100" />
                    </button>
                    <div className="swiper-pagination-custom-floorplan flex justify-center"></div>
                    <button  aria-label="Next" className="swiper-button-next-custom-floorplan">
                      <FaAngleRight className="w-6 h-6 p-1 border border-gray-300 rounded-full hover:bg-gray-100" />
                    </button>
                  </div>
                </Swiper>
              </div>
            )}
          </div>
        </div>
      )}

      {property.around && property.around.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl text-left font-semibold text-indigo-800">
            Property Location
          </h2>
          <p className="text-md font-semibold text-left text-gray-500">
            {property.location}, {property.city}, {property.state}
          </p>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-800 mb-3">
              Around This Property
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.around.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-red-600 text-base">
                      {getPlaceIcon(place.title)}
                    </div>
                    <span className="text-gray-800 text-xs sm:text-sm font-medium truncate">
                      {place.title}
                    </span>
                  </div>
                  <span className="bg-blue-900 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {formatDistance(place.distance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg sm:text-xl text-left font-semibold text-indigo-800 mb-3">
          Explore Map
        </h2>
        <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden shadow-md">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `${property.location}, ${property.city}, ${property.state}`
            )}&output=embed`}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
export default PropertyDetails;
