import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaParking, FaCompass, FaBath } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Pagination } from "swiper/modules";
import config from "../utils/config";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import useWhatsappHook from "../utils/useWhatsappHook";
import { useDispatch, useSelector } from "react-redux";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import Login from "../auth/Login";
import Image from "next/image";
import Link from "next/link";
import theme from "../utils/theme.json";
const formatPrice = (price, propertyFor) => {
  if (price === null || price === undefined || isNaN(price)) return "N/A";
  const num = Number(price);
  const clean = (n) => {
    const f = parseFloat(n.toFixed(2));
    return f % 1 === 0 ? f.toFixed(0) : f;
  };
  if (propertyFor?.toLowerCase() === "rent") {
    if (num >= 1000) return clean(num / 1000) + "K";
    return clean(num).toString();
  }
  if (num >= 10000000) {
    return clean(num / 10000000) + " Cr";
  }
  if (num >= 100000) {
    return num.toLocaleString("en-IN");
  }
  return num.toLocaleString("en-IN");
};
const DealProperties = ({ bestDealProperties, contacted, setContacted }) => {
  const [property] = useState(bestDealProperties || []);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [submittedStates, setSubmittedStates] = useState({});
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
  const { handleAPI, error } = useWhatsappHook();
  const handleEnquireNow = useCallback(
    async (property) => {
      try {
        const data = localStorage.getItem("user");
        if (!data) {
          toast.info("Please Login to Contact Seller!", {
            position: "top-right",
            autoClose: 3000,
          });
          setShowLoginModal(true);
          return;
        }
        const userDetails = JSON.parse(data);
        if (!userDetails?.user_id) {
          toast.error("User details not found!", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        setSelectedProperty(property);
        const payload = {
          property_id: property.unique_property_id,
          user_id: userDetails.user_id,
          name: userDetails.name || "N/A",
          mobile: userDetails.mobile || "N/A",
          email: userDetails.email || "N/A",
          interested_status: 4,
          property_user_id: property.user_id,
        };
        const payload1 = {
          unique_property_id: property.unique_property_id,
          user_id: userDetails.user_id,
          fullname: userDetails.name || "N/A",
          mobile: userDetails.mobile || "N/A",
          email: userDetails.email || "N/A",
        };
        await Promise.all([
          axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, payload1),
          axios.post(`${config.awsApiUrl}/enquiry/v1/postEnquiry`, payload),
          handleAPI(property),
        ]);
        setSubmittedStates((prev) => ({
          ...prev,
          [property.unique_property_id]: {
            ...prev[property.unique_property_id],
            contact: true,
          },
        }));
        setContacted((prev) =>
          prev.includes(property.unique_property_id)
            ? prev
            : [...prev, property.unique_property_id]
        );
        localStorage.setItem("visit_submitted", "true");
        toast.success("Enquiry submitted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        console.error("Enquiry Failed:", err);
        toast.error("Something went wrong while submitting enquiry", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    },
    [handleAPI, setContacted]
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const modalRef = useRef(null);
  const handleClose = () => {
    setShowLoginModal(false);
  };
  const router = useRouter();
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.search);
  useEffect(() => {
    router.prefetch("/listings");
  }, [router]);
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
      const propertyFor = property?.property_for === "Rent" ? "rent" : "sale";
      const propertyId = property.unique_property_id;
      const bhkPart = property.bedrooms ? `${property.bedrooms}-bhk-` : "";
      const subTypePart = property.sub_type ? `${property.sub_type}-` : "";
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
      const citySlug = (searchData?.city || "hyderabad")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const forPart = `for-${propertyFor}-`;
      const seoSlug = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
      const cleanSeoUrl = `/property/${seoSlug}/${propertyId}`;
      router.push(cleanSeoUrl, { state: property });
    },
    [router, dispatch, searchData]
  );
  const handleNavigate = () => {
    const propertyFor = searchData?.tab === "Rent" ? "rent" : "sale";
    const propertyType = (() => {
      switch (searchData?.sub_type) {
        case "Plot":
          return "plots";
        case "Commercial":
          return "commercial-properties";
        case "Rent":
        case "Buy":
        default:
          return "apartments";
      }
    })();
    const citySlug = searchData.location
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");
    const locationSlug = searchData.city
      ? searchData.city
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)/g, "")
      : "";
    const seoUrl = `?${propertyType}_for_${propertyFor}_in_${citySlug}${
      locationSlug ? `_${locationSlug}` : ""
    }`;
    const params = {
      city: searchData.location,
      property_for: searchData?.property_for === "Rent" ? "Rent" : "Sell",
      property_type:
        searchData.tab === "Plot"
          ? "Plot"
          : searchData.tab === "Commercial"
          ? "Commercial"
          : "Apartment",
      location: searchData.location,
    };
    router.push(`/listings${seoUrl}`, { state: params });
  };
  return (
    <div className="px-4 py-12">
      <div className="relative flex items-center mb-4 justify-between">
        <div ref={ref} className="overflow-hidden">
          <h2
            className={`text-3xl font-bold text-gray-900 text-left flex flex-col
          ${visible ? "animate-rise" : "opacity-0 translate-y-10"}`}
          >
            <span>Best Deal Properties</span>
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
        <div>
          <Link
            href="/listings"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/listings")}
            onClick={handleNavigate}
            className="text-[#1D3A76] font-medium hover:text-yellow-500 transition-colors duration-200"
          >
            View All
          </Link>
        </div>
      </div>
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        breakpoints={{
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 2 },
        }}
        className="pb-10 overflow-hidden h-[640px] lg:h-[350px]"
      >
        {property.map((property) => (
          <SwiperSlide key={property?.unique_property_id}>
            <div className="bg-white rounded-lg shadow-lg border-1 border-gray-300 overflow-hidden flex flex-col lg:flex-row">
              <Image
                width={600}
                height={400}
                src={
                  property.image
                    ? `https://api.meetowner.in/assets/v1/serve/${property.image}`
                    : `https://placehold.co/600x400?text=${
                        property?.property_name || "No Image Found"
                      }`
                }
                onClick={() => handleNavigation(property)}
                alt="Property"
                crossOrigin="anonymous"
                className="w-full lg:w-60 h-70 max-h-70 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/600x400?text=${
                    property?.property_name || "No Image Found"
                  }`;
                }}
              />
              <div
                onClick={() => handleNavigation(property)}
                className="p-4 w-full lg:w-2/2 flex flex-col justify-between cursor-pointer"
              >
                <h3 className="text-start text-xl font-semibold mb-2">
                  {property.builder_name ? (
                    <span>{property.builder_name} </span>
                  ) : null}{" "}
                  {property?.property_name}
                </h3>
                <div className="flex items-center text-gray-500 mb-2">
                  <FaMapMarkerAlt className="mr-2 text-gray-600" />
                  <span>{property.location_id}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaCompass className="mr-2" /> {property?.facing}
                  </div>
                  <div className="flex items-center">
                    <FaParking className="mr-2" /> {property?.parking} Parking
                  </div>
                  <div className="flex items-center">
                    <FaBath className="mr-2" /> {property?.bedrooms} Bedrooms
                  </div>
                </div>
                <div
                  onClick={() => handleNavigation(property)}
                  className="text-sm text-[#A4A4A4] font-medium mt-2 flex flex-wrap items-center gap-1"
                >
                  <p>Highlights:</p>
                  {[
                    property?.facing && `${property.facing} Facing`,
                    property?.bedrooms && `${property?.bedrooms} BHK`,
                    property?.property_in &&
                      property?.sub_type &&
                      `${property.property_in} ${property.sub_type}`,
                  ]
                    .filter(Boolean)
                    .map((item, index, arr) => (
                      <React.Fragment key={index}>
                        <p>{item}</p>
                        {index !== arr?.length - 1 && (
                          <span className="text-gray-500">|</span>
                        )}
                      </React.Fragment>
                    ))}
                </div>
                {(property?.facilities ||
                  property?.car_parking ||
                  property?.bike_parking ||
                  property?.private_washrooms ||
                  property?.public_washrooms ||
                  property?.public_parking ||
                  property?.private_parking) && (
                  <div className="text-sm text-[#A4A4A4] font-medium mt-2 flex flex-wrap items-center gap-1">
                    <p>Amenities:</p>
                    {property?.facilities
                      ? property?.facilities
                          .split(",")
                          .slice(0, 5)
                          .map((facility, index) => (
                            <React.Fragment key={index}>
                              <p>{facility.trim()}</p>
                              {index !== 4 && (
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full inline-block mx-1" />
                              )}
                            </React.Fragment>
                          ))
                      : [
                          property?.car_parking &&
                            `${property?.car_parking} Car Parking`,
                          property?.bike_parking &&
                            `${property?.bike_parking} Bike Parking`,
                          property?.private_washrooms && "Private Washroom",
                          property?.public_washrooms && "Public Washroom",
                          property?.public_parking && "Public Parking",
                          property?.private_parking && "Private Parking",
                        ]
                          .filter(Boolean)
                          .map((item, index, arr) => (
                            <React.Fragment key={index}>
                              <p>{item}</p>
                              {index !== arr?.length - 1 && (
                                <span className="text-gray-500">|</span>
                              )}
                            </React.Fragment>
                          ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xl font-bold text-[#1D3A76]">
                    ₹ {formatPrice(property.property_cost)}
                  </div>
                  <button
                    onClick={() => handleEnquireNow(property)}
                    disabled={
                      submittedStates[property.unique_property_id]?.contact ||
                      contacted.includes(property.unique_property_id)
                    }
                    className={`
                        px-6 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300
                        ${
                          submittedStates[property.unique_property_id]
                            ?.contact ||
                          contacted.includes(property.unique_property_id)
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : `${theme.button.secondary.bg} ${theme.button.secondary.text} hover:opacity-90`
                        }
                      `}
                  >
                    {submittedStates[property.unique_property_id]?.contact ||
                    contacted.includes(property.unique_property_id)
                      ? "Submitted"
                      : "Enquire Now"}
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination-custom flex   justify-center"></div>
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
export default DealProperties;
