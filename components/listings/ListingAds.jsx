import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Login from "../auth/Login";
import noPropertiesFound from "../../app/assets/Images/urban-planning_10891692.png";
const formatPrice = (value) => {
  if (!value || isNaN(value)) return "Price on Request";
  const num = parseFloat(value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)} K`;
  return `₹${num.toLocaleString("en-IN")}`;
};
const ListingAds = () => {
  const { ads } = useSelector((state) => state.ads);
  const searchData = useSelector((state) => state.search);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  useEffect(() => {
    if (ads && Array.isArray(ads)) {
      const valid = ads.filter((p) => p?.image && p?.property_name).slice(0, 6);
      setProperties(valid);
      setLoading(false);
    }
  }, [ads]);
  const handleNavigation = useCallback(
    (property) => {
      dispatch(setPropertyDetails({ property }));
      const slug = [
        property.bedrooms ? `${property.bedrooms}-bhk` : "",
        property.sub_type?.toLowerCase().replace(/\s+/g, "-"),
        property.property_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        property.builder_name
          ? `by-${property.builder_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`
          : "",
        `for-${property.property_for === "Rent" ? "rent" : "sale"}-in`,
        property.location_id?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        (searchData?.city || "hyderabad")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      ]
        .filter(Boolean)
        .join("-");
      router.push(`/property/${slug}/${property.unique_property_id}`);
    },
    [dispatch, router, searchData]
  );
  const handleContact = (e) => {
    e.stopPropagation();
    const user = localStorage.getItem("user");
    if (!user) {
      toast.info("Please login to contact the owner");
      setShowLoginModal(true);
    } else {
      toast.success("Enquiry sent successfully!");
    }
  };
  if (loading) {
    return (
      <div className="sticky top-20 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="space-y-5">
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (properties.length === 0) {
    return (
      <div className="sticky top-20 bg-gray-50 rounded-2xl p-10 text-center border border-gray-200">
        <Image
          src={noPropertiesFound}
          alt="No properties"
          width={80}
          height={80}
          className="mx-auto mb-5 opacity-60"
        />
        <p className="text-gray-700 font-medium">
          No featured listings right now
        </p>
        <p className="text-sm text-gray-500 mt-2">New properties coming soon</p>
      </div>
    );
  }
  const featured = properties[0];
  const others = properties.slice(1, 5);
  return (
    <>
      <div className="sticky top-20 z-10">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {featured && (
            <div
              onClick={() => handleNavigation(featured)}
              className="group cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={`https://api.meetowner.in/assets/v1/serve/${featured.image}`}
                  alt={featured.property_name}
                  width={800}
                  height={500}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-linear-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                <h3 className="font-bold text-base text-gray-900 line-clamp-1 leading-tight">
                  {featured.property_name}
                </h3>

                <p className="text-xs font-medium text-teal-700 flex items-center gap-1.5">
                  <span className="bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-md">
                    {featured.bedrooms ? `${featured.bedrooms} BHK ` : ""}
                    {featured.ad_sub_type || "Property"}
                    {featured.property_in ? ` • ${featured.property_in}` : ""}
                  </span>
                  <span className="text-gray-600">
                    for {featured.property_for === "Rent" ? "Rent" : "Sale"} in{" "}
                    {featured.location_id}
                  </span>
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(featured.property_cost)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigation(featured);
                      }}
                      className="text-xs font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContact(e);
                      }}
                      className="text-xs font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 px-5 py-2 rounded-lg hover:shadow-lg transition"
                    >
                      Contact Owner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {others.map((property) => (
              <div
                key={property.unique_property_id}
                onClick={() => handleNavigation(property)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex gap-3 items-start">
                  <div className="shrink-0">
                    <Image
                      src={`https://api.meetowner.in/assets/v1/serve/${property.image}`}
                      alt={property.property_name}
                      width={240}
                      height={180}
                      className="w-28 h-24 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">
                      {property.property_name}
                    </h4>

                    <p className="text-xs text-gray-600 font-medium leading-snug">
                      {property.bedrooms && (
                        <span className="font-semibold text-gray-800">
                          {property.bedrooms} BHK{" "}
                        </span>
                      )}
                      {property.ad_sub_type && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                          {property.ad_sub_type}
                        </span>
                      )}
                      {property.property_in && ` • ${property.property_in}`}
                      <span className="text-gray-500">
                        {" "}
                        for {property.property_for === "Rent" ? "Rent" : "Sale"}
                      </span>
                      <span className="text-gray-600">
                        {" "}
                        in {property.location_id}
                      </span>
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-base font-bold text-gray-900">
                        {formatPrice(property.property_cost)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation(property);
                        }}
                        className="text-xs font-semibold text-teal-600 border border-teal-600 px-5 py-1.5 rounded-lg hover:bg-teal-50 transition"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Login setShowLoginModal={setShowLoginModal} />
          </div>
        </div>
      )}
    </>
  );
};
export default ListingAds;
