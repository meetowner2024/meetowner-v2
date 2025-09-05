import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import {
  setPropertyDetails
} from "../store/slices/propertyDetails";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import config from "../utils/config";
import Login from "../auth/Login";
import noPropertiesFound from "../../app/assets/Images/urban-planning_10891692.png";
import theme from "../utils/theme.json";
function PropertyCardSkeleton() {
  return (
    <div className="relative rounded-xl shadow-lg overflow-hidden bg-white">
      <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-6 w-24 mx-auto text-transparent text-xs font-medium py-2 px-4 text-center rounded-b-md"></div>
      <div className="w-full h-32 bg-gray-200 animate-pulse" />
      <div className="p-4 text-left">
        <div className="h-5 w-24 bg-gray-200 animate-pulse mb-2 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}
function FeaturedPropertySkeleton() {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-xl" />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-full" />
        <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-full" />
      </div>
    </div>
  );
}
const ListingAds = () => {
  const [property, setProperty] = useState([]);
  const pathname = usePathname();
  const searchData = useSelector((state) => state.search);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const modalRef = useRef(null);
  const swiperRef = useRef(null);
  const fetchLatestProperties = async () => {
    setProperty([]);
    try {
      const response = await fetch(
        `${config.awsApiUrl}/adAssets/v1/getAds?ads_page=listing_ads&city=${searchData.city}`
      );
      const data = await response.json();
      const validProperties = data.ads.filter(
        (item) => item.property_data?.image && item.property_data?.property_name
      );
      setProperty(validProperties);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLatestProperties();
  }, [searchData]);
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
  const handleContactSeller = async (property) => {
    try {
      const data = localStorage.getItem("user");
      if (!data) {
        toast.info("Please Login to Contact!");
        setShowLoginModal(true);
        return;
      }
      const userDetails = JSON.parse(data);
      const payload = {
        unique_property_id: property.unique_property_id,
        user_id: userDetails.user_id,
        fullname: userDetails.name,
        mobile: userDetails.mobile,
        email: userDetails.email,
      };
      await axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, payload);
    } catch (err) {
      toast.error("Something went wrong while submitting enquiry");
    }
  };
  const handleClose = () => {
    setShowLoginModal(false);
  };
  const formatToIndianCurrency = (value) => {
    if (!value || isNaN(value)) return "N/A";
    const numValue = parseFloat(value);
    if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
    if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
    if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
    return numValue.toString();
  };
  if (loading) {
    return (
      <div className="sticky top-20 lg:block md:block z-20 bg-white p-4 rounded-2xl shadow-xl">
        <FeaturedPropertySkeleton />
        <div className="mt-4 relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: true }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="w-full"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <SwiperSlide key={`skeleton-${index}`}>
                <PropertyCardSkeleton />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  }
  return (
    <div className="sticky top-20 lg:block md:block z-20  p-4 rounded-2xl shadow-xl">
      {}
      {property[2]?.property_data && (
        <div className="relative rounded-xl overflow-hidden cursor-pointer group">
          <div className="absolute top-4 left-4 z-10">
            <span
              className={` ${theme.button.secondary.bg} text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse`}
            >
              Featured
            </span>
          </div>
          <Image
            width={600}
            height={400}
            src={
              property[2]?.property_data?.image
                ? `https://api.meetowner.in/assets/v1/serve/${property[2].property_data.image}`
                : `https://via.placeholder.com/400x200?text=No+Image`
            }
            alt="Featured Property"
            crossOrigin="anonymous"
            className="w-full h-64 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg font-bold">
              {property[2].property_data.property_name}
            </h3>
            <p className="text-sm font-medium">
              ₹{formatToIndianCurrency(property[2].property_data.property_cost)}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                aria-label="View Details"
                onClick={() => handleNavigation(property[2].property_data)}
                className="bg-transparent cursor-pointer border border-white text-white font-semibold px-4 py-1 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                View Details
              </button>
              <button
                aria-label="Contact Seller"
                onClick={() => handleContactSeller(property[2].property_data)}
                className="bg-transparent cursor-pointer border border-white text-white font-semibold px-4 py-1 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      )}
      {}
      {property.length > 0 ? (
        <div className="mt-4 relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: true }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="w-full h-[280px]"
          >
            {property.map((item, i) => (
              <SwiperSlide key={item.id || i}>
                <div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="relative rounded-xl shadow-lg overflow-hidden bg-white group cursor-pointer transition-transform duration-300 hover:scale-105  "
                  onClick={() => handleNavigation(item.property_data)}
                >
                  <div className="absolute top-2 left-2 z-10 ">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                      Latest
                    </span>
                  </div>
                  <Image
                    width={600}
                    height={400}
                    src={
                      item.property_data?.image
                        ? `https://api.meetowner.in/assets/v1/serve/${item.property_data.image}`
                        : `https://via.placeholder.com/400x200?text=No+Image`
                    }
                    alt={
                      item.property_data?.property_name || `Property ${i + 1}`
                    }
                    crossOrigin="anonymous"
                    className="w-full h-42 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 text-left bg-gradient-to-br from-teal-50 to-cyan-50">
                    <p className="font-bold text-blue-900">
                      ₹
                      {formatToIndianCurrency(
                        item.property_data?.property_cost || 0
                      )}
                    </p>
                    <h4 className="font-semibold text-md text-gray-900 line-clamp-1">
                      {item.property_data?.property_name || "Unnamed Property"}
                    </h4>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-gray-200 rounded-xl p-6 bg-white shadow-md text-center">
          <Image
            width={600}
            height={400}
            src={noPropertiesFound.src}
            alt="No Properties Found"
            crossOrigin="anonymous"
            className="w-24 h-24 object-contain mb-4 animate-bounce"
          />
          <div className="text-md font-semibold text-gray-700 mb-2">
            No Properties Found
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Try adjusting your filters or location to discover available
            properties.
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold px-4 py-2 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
          >
            Reset Filters
          </button>
        </div>
      )}
      {}
      {showLoginModal && (
        <div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            ref={modalRef}
            className="relative w-[90%] max-w-sm bg-white rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
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
export default ListingAds;
