import React, { memo, useCallback, useState } from "react";
import whatsappIcon from "../../app/assets/Images/whatsapp (3).png";
import meetlogo from "../../app/assets/Images/Favicon@10x.png";
import theme from "../utils/theme.json";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineVerified } from "react-icons/md";
import { toast } from "react-toastify";
import Image from "next/image";
const formatToIndianCurrency = (value) => {
  if (!value || isNaN(value)) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};
const formatValue = (value) => {
  return value % 1 === 0
    ? parseInt(value)
    : parseFloat(value).toFixed(2).replace(/\.00$/, "");
};
const getPriceDisplay = (propertyFor, price) => {
  if (propertyFor === "Rent") {
    return price ? `₹ ${formatToIndianCurrency(price)}/month` : "N/A";
  }
  return price ? `₹ ${formatToIndianCurrency(price)}` : "N/A";
};
const imageLoader = ({ src, width, quality }) => {
  return `${src}`;
};
const PropertyCard = memo(
  ({
    property,
    index,
    handleNavigation,
    likedProperties,
    handleLike,
    handleScheduleVisit,
    submittedState,
    contacted,
    getOwnerDetails,
    setShowLoginModal,
  }) => {
    const [imageFailed, setImageFailed] = useState(false);
    const handleChatClick = useCallback(
      async (e) => {
        e.stopPropagation();
        const data = localStorage.getItem("user");
        const userData = JSON.parse(data);
        if (!data) {
          toast.info("Please Login to Schedule Visits!", {
            position: "top-right",
            autoClose: 3000,
          });
          setShowLoginModal(true);
          return;
        }
        try {
          const sellerData = await getOwnerDetails(property);
          const phone = sellerData?.mobile || sellerData?.phone;
          const name = sellerData?.name || "";
          if (phone) {
            const propertyFor =
              property?.property_for === "Rent" ? "rent" : "buy";
            const category =
              property?.sub_type === "Apartment" ||
              property?.sub_type === "Individual house"
                ? `${property?.bedrooms}BHK`
                : property?.sub_type === "Plot"
                ? "Plot"
                : "Property";
            const propertyId = property?.unique_property_id;
            const propertyNameSlug = property?.property_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/(^-|-$)/g, "");
            const locationSlug = property?.location_id
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/(^-|-$)/g, "");
            const citySlug = property?.city
              ? property?.city
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "_")
                  .replace(/(^-|-$)/g, "")
              : "";
            const seoUrl = `${propertyFor}_${category}_${property?.sub_type}_${propertyNameSlug}_in_${locationSlug}_${citySlug}_Id_${propertyId}`;
            const fullUrl = `${window.location.origin}/property?${seoUrl}`;
            const encodedMessage = encodeURIComponent(
              `Hi ${name},\nI'm interested in this property: ${property?.property_name}.\n${fullUrl}\nI look forward to your assistance in the home search. Please get in touch with me at ${userData?.mobile} to initiate the process.`
            );
            const whatsappUrl = `https://wa.me/+91${phone}?text=${encodedMessage}`;
            window.open(whatsappUrl, "_blank");
          } else {
            toast.error("Owner's phone number is not available.", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } catch (error) {
          console.error("Error in handleChatClick:", error);
          toast.error("Failed to fetch owner's contact details.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      },
      [getOwnerDetails, property, setShowLoginModal]
    );
    const handleContactClick = useCallback(
      (property) => {
        if (!property?.unique_property_id) {
          toast.error("Invalid property data!", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        handleScheduleVisit(property);
      },
      [handleScheduleVisit]
    );
    const [isLoading, setIsLoading] = useState(true);
    const imageSrc = imageFailed
      ? `https://placehold.co/600x400/gray/white?text=No Image Found`
      : property?.image
      ? `https://api.meetowner.in/assets/v1/serve/${property?.image}`
      : `https://placehold.co/600x400/gray/white?text=No Image Found`;
    return (
      <div
        key={`property-${index}`}
        className="flex flex-col items-center p-1 md:flex-row rounded-2xl 
             shadow-[0_2px_10px_rgba(0,0,0,0.1)]  
             lg:shadow-[0_4px_20px_rgba(0,0,0,0.15)]  
             hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)]  
             lg:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]  
             transition-shadow duration-300 bg-white w-full min-h-[300px] "
        style={{ minHeight: "300px", height: "auto" }}
      >
        <div className="bg-[#ffff] rounded-[20px] p-3 w-full h-auto flex flex-col">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full h-auto lg:w-[400px] gap-2">
              <div className="rounded-lg overflow-hidden  relative">
                {isLoading && (
                  <div className="absolute inset-0 animate-pulse bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-bold">
                      Loading image...
                    </span>
                  </div>
                )}
                <Image
                  loader={imageLoader}
                  width={600}
                  height={400}
                  onClick={() => handleNavigation(property)}
                  src={imageSrc}
                  alt="Property"
                  crossOrigin="anonymous"
                  className={`w-full h-[250px] cursor-pointer object-cover rounded-md transition-opacity duration-500 ${
                    isLoading && !imageFailed ? "opacity-0" : "opacity-100"
                  }`}
                  priority={index >= 3}
                  onLoadingComplete={() => setIsLoading(false)}
                  onError={() => {
                    setImageFailed(true);
                    setIsLoading(false);
                  }}
                  quality={50}
                />
              </div>
            </div>
            <div className="flex-1 max-w-full md:max-w-[500px] flex flex-col">
              <div className="mb-3 text-left">
                <div
                  className="flex flex-col md:flex-row justify-between md:items-center cursor-pointer"
                  onClick={() => handleNavigation(property)}
                >
                  <p className="text-[#1D3A76] font-bold text-[15px]">
                    {property?.sub_type === "Apartment"
                      ? `${property?.bedrooms} BHK ${
                          property?.property_type
                            ? property?.property_type
                            : property?.sub_type || ""
                        } for ${property?.property_for}`
                      : `${property?.sub_type} for ${property?.property_for}`}{" "}
                    in {property?.locality_name}, {property?.google_address}
                  </p>
                  <div className="flex items-center gap-2 text-[#1D3A76] text-sm font-medium my-2 md:my-0">
                    {likedProperties?.includes(property?.unique_property_id) ? (
                      <IoIosHeart
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(property);
                        }}
                        className="p-1 w-7 h-7 bg-white rounded-2xl text-red-600 cursor-pointer"
                      />
                    ) : (
                      <IoIosHeartEmpty
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(property);
                        }}
                        className="p-1 w-7 h-7 bg-white rounded-2xl text-red-600 hover:text-red-500 cursor-pointer"
                      />
                    )}
                    <MdOutlineVerified className="text-xl text-green-500" />
                    <p className="text-[12px] lg:text-base">Verified</p>
                  </div>
                </div>
                <div
                  className="flex flex-col lg:flex-row justify-between cursor-pointer"
                  onClick={() => handleNavigation(property)}
                >
                  <p className="text-[#1D3A76] font-bold text-base md:text-[18px]">
                    {property?.property_name}
                  </p>
                  <p className="flex flex-col items-end text-[#1D3A76] font-semibold text-[18px] max-h-5">
                    <span className="flex items-center font-bold text-[15px]">
                      {property?.property_for === "Rent" ? (
                        <span className="flex flex-col items-end">
                          <span className="flex gap-x-1">
                            {getPriceDisplay(
                              property?.property_for,
                              property?.monthly_rent
                            )}
                            {property?.property_cost_type && (
                              <span>{property.property_cost_type}</span>
                            )}
                          </span>
                          <span className="text-xs font-normal text-[#A4A4A4]">
                            Expected Monthly Rent
                          </span>
                        </span>
                      ) : (
                        <span className="flex gap-x-1">
                          {getPriceDisplay(
                            property?.property_for,
                            property?.property_cost
                          )}
                          {property?.property_cost_type && (
                            <span>({property.property_cost_type})</span>
                          )}
                        </span>
                      )}
                    </span>
                    {property?.loan_facility === "Yes" ? (
                      <span className="text-xs text-[#A4A4A4]">
                        EMI option Available
                      </span>
                    ) : (
                      <span className="text-xs text-[#A4A4A4]">
                        One Time Payment
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div
                className="mb-4 relative flex-1 cursor-pointer"
                onClick={() => handleNavigation(property)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-wrap gap-2 items-center text-[#204691] font-medium text-sm">
                    {[
                      property?.sub_type === "Plot"
                        ? property?.plot_area
                          ? `${formatValue(property?.plot_area)} ${
                              property?.area_units
                            } Plot area`
                          : property?.carpet_area
                          ? `${formatValue(property?.carpet_area)} ${
                              property?.area_units
                            } Carpet area`
                          : null
                        : property?.builtup_area
                        ? `${formatValue(property?.builtup_area)} ${
                            property?.area_units
                          } Builtup area`
                        : null,
                      property?.investor_property === "Yes" &&
                        "Investor Property",
                      property?.under_construction && "Under Construction",
                      property?.under_construction &&
                        `Possession: ${property?.under_construction.slice(
                          2,
                          10
                        )}`,
                      property?.possession_status === "Immediate" &&
                        "Immediate",
                      property?.possession_status === "Future" && "Future",
                      property?.furnished_status &&
                        (property?.furnished_status === "Unfurnished"
                          ? "Unfurnished"
                          : `${property?.furnished_status} Furnished`),
                    ]
                      .filter(Boolean)
                      .map((item, index, arr) => (
                        <React.Fragment key={index}>
                          <p>{item}</p>
                          {index !== arr.length - 1 && (
                            <span className="text-gray-400 mx-1">|</span>
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                </div>
                <div className="text-sm text-[#A4A4A4] font-medium mt-2 flex flex-wrap items-center gap-1">
                  <p className="text-[#1D3A76]">Highlights :</p>
                  {[
                    property?.facing && `${property?.facing} Facing`,
                    property?.bedrooms && `${property?.bedrooms} BHK`,
                    property?.property_in &&
                      property?.sub_type &&
                      `${property?.property_in} ${property?.sub_type}`,
                  ]
                    .filter(Boolean)
                    .map((item, index, arr) => (
                      <React.Fragment key={index}>
                        <p>{item}</p>
                        {index !== arr.length - 1 && (
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
                    <p className="text-[#1D3A76]">Amenities :</p>
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
                              {index !== arr.length - 1 && (
                                <span className="text-gray-500">|</span>
                              )}
                            </React.Fragment>
                          ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-[8px]  border-gray-200 border rounded-xl shadow-sm ">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 lg:gap-3 sm:justify-start justify-between w-full min-w-0">
                  <div className="flex justify-between items-center w-full sm:w-auto">
                    <div className="flex gap-1 items-center">
                      <Image
                        width={100}
                        height={100}
                        src={meetlogo}
                        alt="Meet Owner Logo"
                        className="w-5 h-5"
                      />
                      <p
                        className={`font-medium text-xs truncate ${
                          property?.user?.user_type === 3
                            ? "text-blue-900"
                            : property?.user?.user_type === 4
                            ? "text-purple-600"
                            : property?.user?.user_type === 5
                            ? "text-green-600"
                            : property?.user?.user_type === 6
                            ? "text-orange-500"
                            : "text-blue-900"
                        }`}
                      >
                        {property?.user?.user_type === 3
                          ? "Builder"
                          : property?.user?.user_type === 4
                          ? "Agent"
                          : property?.user?.user_type === 5
                          ? "Owner"
                          : property?.user?.user_type === 6
                          ? "Channel Partner"
                          : "Seller"}
                      </p>
                    </div>
                    <p className="text-gray-500 font-medium text-sm sm:hidden truncate">
                      {property?.user?.name}
                    </p>
                  </div>
                  <p className="text-gray-500 font-semibold text-sm hidden sm:block truncate">
                    {property?.user?.name}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                  <button
                    onClick={handleChatClick}
                    className="flex items-center justify-center gap-1 border border-[#25D366] text-[#25D366] px-4 lg:px-5 py-2 rounded-full text-sm font-medium hover:bg-green-50 transition-all duration-300"
                  >
                    <Image
                      width={100}
                      height={100}
                      src={whatsappIcon?.src}
                      alt="WhatsApp"
                      className="w-4 h-4"
                    />
                    Chat
                  </button>
                  <button
                    onClick={() => handleContactClick(property)}
                    className={`${theme.button.secondary.bg} ${theme.button.secondary.text} px-4 lg:px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:opacity-90`}
                    disabled={
                      submittedState?.contact ||
                      contacted.includes(property.unique_property_id)
                    }
                  >
                    {contacted.includes(property.unique_property_id) ||
                    submittedState?.contact
                      ? "Submitted"
                      : "Contact"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
export default PropertyCard;
