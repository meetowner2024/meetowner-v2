"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import { MapPin, Home, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
const formatPrice = (cost) => {
  if (!cost) return "Price on Request";
  return cost >= 10000000
    ? `₹${(cost / 10000000).toFixed(1)} Cr`
    : `₹${(cost / 100000).toFixed(1)} L`;
};
export default function FeaturedProjectsCard() {
  const listingAds = useSelector((state) => state.ads.listingAds);

  const [projects, setProjects] = useState([]);
  const [type, setType] = useState("under_construction");

  useEffect(() => {
    if (!listingAds) return;

    const last = localStorage.getItem("lastProjectType") || "ready_to_move";
    const next =
      last === "ready_to_move" ? "under_construction" : "ready_to_move";

    setType(next);
    localStorage.setItem("lastProjectType", next);

    const list = listingAds?.[next] || [];
    setProjects(Array.isArray(list) ? list.slice(0, 5) : []);
  }, [listingAds]);

  if (projects.length === 0) return null;

  const isReadyToMove = type === "ready_to_move";
  return (
    <div className="my-2 px-1">
      {}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[#1D3A76] flex items-center gap-2">
          <Home className="w-5 h-5 text-[#3A59D1]" />
          {isReadyToMove ? "Ready to Move In" : "Launching Soon"}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md ${
            isReadyToMove
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : "bg-purple-100 text-purple-700 border border-purple-300"
          }`}
        >
          {isReadyToMove ? "Move-in Ready" : "Under Construction"}
        </span>
      </div>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1.25}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={projects.length > 2}
        breakpoints={{
          640: { slidesPerView: 1.8 },
          768: { slidesPerView: 2.1 },
        }}
        className="!pb-2"
      >
        {projects.map((p) => (
          <SwiperSlide key={p.unique_property_id}>
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70 hover:ring-[#3A59D1]/70 hover:shadow-xl transition-all duration-300">
                {}
                <div className="aspect-[7/3] relative">
                  <Image
                    src={`https://api.meetowner.in/assets/v1/serve/${p.image}`}
                    alt={p.property_name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                    sizes="(max-width: 768px) 90vw, 45vw"
                    priority={false}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x480?text=PALAIS+ROYAL";
                    }}
                  />
                  {}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  {}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-lg drop-shadow-lg">
                      {formatPrice(Number(p.property_cost) || 0)}
                    </p>
                  </div>
                  {}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md">
                    <Building2 className="w-3.5 h-3.5 text-[#1D3A76]" />
                    <span className="text-xs font-bold text-[#1D3A76] uppercase tracking-wider">
                      {p.sub_type || "Apartment"}
                    </span>
                  </div>
                  {}
                  {isReadyToMove && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                      READY
                    </div>
                  )}
                </div>
                {}
                <div className="p-3.5">
                  <h4 className="font-bold text-[#1D3A76] text-sm line-clamp-1 leading-tight">
                    {p.property_name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    by {p.builder_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {p.bedrooms} BHK • {p.location_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
