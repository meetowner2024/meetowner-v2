import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";
import config from "../utils/config";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Image from "next/image";
import theme from "../utils/theme.json";
const HighDemandProjects = ({ highDemandProperties }) => {
  const [property] = useState(highDemandProperties || []);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.search);
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
  return (
    <div className="px-4 py-8">
      <div ref={ref} className=" relative overflow-hidden">
        <h2
          className={`text-3xl font-bold text-gray-900 text-left flex flex-col
          ${visible ? "animate-rise" : "opacity-0 translate-y-10"}`}
        >
          <span>High-demand projects to invest now</span>
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
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        pagination={{ clickable: true, el: ".swiper-pagination-custom" }}
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="mt-6"
      >
        {property.map((project, index) => (
          <SwiperSlide key={index}>
            <div className="relative bg-white shadow-lg rounded-lg overflow-hidden group">
              <Image
                width={600}
                height={400}
                src={
                  project.image
                    ? `https://api.meetowner.in/assets/v1/serve/${project.image}`
                    : `https://placehold.co/600x400?text=${
                        project?.property_name || "No Image Found"
                      }`
                }
                onClick={() => handleNavigation(project)}
                alt={project?.property_name}
                crossOrigin="anonymous"
                className="w-full h-40 object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/600x400?text=${
                    project?.property_name || "No Image Found"
                  }`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  aria-label="View Details"
                  onClick={() => handleNavigation(project)}
                  className={`bg-white text-[#1D3A76] px-4 py-2 rounded-full font-semibold cursor-pointer shadow-md ${theme.button.secondary.hover}  transition-all`}
                >
                  View Details
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="flex justify-center items-center gap-6 mt-6 max-w-fit mx-auto">
          <button aria-label="Swipe Left" className="swiper-button-prev-custom">
            <FaAngleLeft className="w-6 h-6 p-1 border border-gray-400 rounded-full hover:bg-gray-200" />
          </button>
          <div className="swiper-pagination-custom flex justify-center"></div>
          <button
            aria-label="Swipe Right"
            className="swiper-button-next-custom"
          >
            <FaAngleRight className="w-6 h-6 p-1 border border-gray-400 rounded-full hover:bg-gray-200" />
          </button>
        </div>
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
    </div>
  );
};
export default HighDemandProjects;
