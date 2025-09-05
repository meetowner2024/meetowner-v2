import {
  MapPin,
  Calendar,
  Heart,
  Star,
  Phone,
  FileText,
  Download,
  CalendarClock,
  Building2,
  Ruler,
  LayoutGrid,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import { useRouter } from "next/navigation";
import Image from "next/image";
export const PropertyCard = ({ property, viewMode }) => {
 
  const router = useRouter();
  const formatToIndianCurrency = (value) => {
    if (!value || isNaN(value)) return "N/A";
    const numValue = parseFloat(value);
    if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
    if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
    if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
    return numValue.toString();
  };
  const handleDownload = (filePath, fileName) => {
    if (!filePath) {
      alert(`File not available for ${fileName}`);
      return;
    }
    const link = document.createElement("a");
    link.href = `https://api.meetowner.in/assets/v1/serve/${filePath}`;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleCardClick = () => {
    router.push(`/new-launch/${property.unique_property_id}`);
  };
  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden group ${
        viewMode === "grid" ? "flex h-64" : "flex flex-col"
      }`}
    >
      <div
        className={`relative ${
          viewMode === "grid" ? "flex-shrink-0 w-56" : "w-full h-48"
        }`}
      >
        <Swiper
          modules={[Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
          }}
          className="w-full h-full"
        >
          {property.gallery_images?.length > 0 ? (
            property.gallery_images.map((image) => (
              <SwiperSlide key={image.id}>
                <Image
                  
                  width={800} 
                  height={450}
                  src={`https://api.meetowner.in/assets/v1/serve/${image.image}`}
                  alt={property.property_name || "Property Image"}
                  className={`${
                    viewMode === "grid" ? "w-full h-full" : "w-full h-48"
                  } object-cover group-hover:scale-105 transition-transform duration-300`}
                  crossOrigin="anonymous"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/800x450")
                  }
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <Image
                
                width={800}
                height={450}
                
                src="https://via.placeholder.com/800x450"
                alt="Placeholder"
                className={`${
                  viewMode === "grid" ? "w-full h-full" : "w-full h-48"
                } object-cover`}
              />
            </SwiperSlide>
          )}
        </Swiper>
        <div className="absolute z-9999 top-2 left-2 flex items-center space-x-1">
          {property.launch_type && (
            <span className="bg-orange-400 z-9999 text-white text-xs font-medium px-2 py-1 rounded">
              {property.launch_type}
            </span>
          )}
          {property.is_rera_registered === 1 && (
            <span className="bg-green-600 z-9999 flex gap-1 items-center text-white text-xs font-medium px-2 py-1 rounded">
              <MdOutlineVerified className="text-sm text-white" />
              Rera
            </span>
          )}
        </div>
        {/* <div className="absolute z-9999 top-2 right-2">
          <button
            onClick={() => toggleFavorite(property.unique_property_id)}
            className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
          >
            <Heart className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div> */}
        <div className="absolute z-9999 bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <span className="mr-1">📷</span>
          {property.gallery_images?.length || 0} Photos
        </div>
      </div>
      <div className="flex-1 p-4 gap-1 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-left text-gray-500 mb-1 truncate">
              {property.property_name || "Unknown Property"}
            </h3>
            <p className="text-xs font-semibold text-gray-600 flex items-center truncate">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              {`${property.location || "Unknown Location"}, ${
                property.city || "Unknown City"
              }`}
            </p>
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <p className="text-md font-bold text-[#1D3A76]">
              ₹ {formatToIndianCurrency(property.property_cost_from)} -
              {formatToIndianCurrency(property.property_cost_upto)}
            </p>
            <p className="text-xs font-bold text-gray-600">
              {property.sub_type || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between ">
          <p className="text-xs font-semibold text-gray-600 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Possession:{" "}
            {property.possession_end_date
              ? new Date(property.possession_end_date).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        {property.description && (
          <div className="">
            <p className="text-xs text-left md:text-sm text-gray-700 break-words line-clamp-2">
              {property.description?.length > 200
                ? `${property.description.slice(0, 200)}...`
                : property.description}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <Building2 className="h-2.5 w-2.5 mr-1 text-blue-600" />
            <span className="font-semibold mr-1">Builder:</span>
            {property.builder_name || "N/A"}
          </div>
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <CalendarClock className="h-2.5 w-2.5 mr-1 text-green-600" />
            {property.possession_status || "N/A"}
          </div>
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <Ruler className="h-2.5 w-2.5 mr-1 text-purple-600" />
            <span className="font-semibold mr-1">BuiltUp Area:</span>
            {property.sizes?.[0]?.buildup_area || "N/A"} sq ft
          </div>
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <LayoutGrid className="h-2.5 w-2.5 mr-1 text-indigo-600" />
            <span className="font-semibold mr-1">Carpet Area:</span>
            {property.sizes?.[0]?.carpet_area || "N/A"} sq ft
          </div>
        </div>
        <div className="flex flex-wrap gap-1 ">
          <p className="text-xs font-semibold text-gray-600">Payment Modes:</p>
          {property.otp_options?.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
            >
              <Star className="h-2.5 w-2.5 mr-1 text-yellow-500" />
              {feature}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              handleDownload(
                property.brochure,
                `${property.property_name || "property"}-brochure.pdf`
              )
            }
            className="flex-1 bg-[#1D3A76] hover:bg-blue-700 cursor-pointer text-white py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center"
          >
            <Download className="h- w-4 mr-1" />
            Brochure
          </button>
          <button
            onClick={() =>
              handleDownload(
                property.price_sheet,
                `${property.property_name || "property"}-price-sheet.pdf`
              )
            }
            className="flex-1 border border-[#1D3A76] text-[#1D3A76] cursor-pointer hover:bg-blue-50 py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            Price Sheet
          </button>
          <button className="flex-1 bg-[#25D366] hover:bg-[#1EB554] cursor-pointer text-white py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center">
            <FaWhatsapp className="h-4 w-4 mr-1 text-white" />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};
