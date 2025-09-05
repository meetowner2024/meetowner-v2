import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
const RecommendedSellers = ({ recommendedSellers }) => {
  const [sellers] = useState(recommendedSellers || []);
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

  return (
    <div
      className="py-2"
      style={{ background: "linear-gradient(135deg, #547792, #605EA1)" }}
    >
      <div className="mx-auto px-4">
        <div ref={ref} className="overflow-hidden">
          <h2
            className={`text-3xl font-bold text-white text-left flex flex-col
          ${visible ? "animate-rise" : "opacity-0 translate-y-10"}`}
          >
            <span>Recommended Sellers</span>

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
          <p
            className={`text-start text-white mb-6 ${
              visible ? "animate-rise" : "opacity-0 translate-y-10"
            }`}
          >
            Sellers With Complete Knowledge About Locality and Verified Listings
          </p>
        </div>

        <div className="relative ">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            pagination={{ clickable: true }}
            className="rounded-lg overflow-hidden h-[320px] sm:h-[300px] md:h-[310px] lg:h-[310px]"
          >
            {sellers.map((seller, index) => (
              <SwiperSlide key={`${index}-${index}`} className="p-2">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <Image
                    width={100}
                    height={100}
                    src={
                      seller.photo
                        ? `https://api.meetowner.in/assets/v1/serve/${seller.photo}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            seller?.name || "User"
                          )}&color=393E46&size=100&background=fff`
                    }
                    unoptimized
                    alt={seller?.name}
                    crossOrigin={seller.photo ? "anonymous" : undefined}
                    className="w-full h-48 sm:h-48 md:h-48 lg:h-38 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                    }}
                  />

                  <div className="p-3 flex justify-between items-center border-t border-gray-200">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {seller.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Properties - {seller.property_count}
                      </p>
                    </div>
                    <div className="text-right border-l border-gray-500 pl-3">
                      <p className="text-sm text-gray-600">{seller.location}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            className="swiper-button-prev !text-white !bg-black/30 hover:!bg-white hover:!text-black 
                 !w-10 !h-10 !rounded-full !absolute !left-0 !top-1/2 !-translate-y-1/2 after:!text-lg"
          />
          <div
            className="swiper-button-next !text-white !bg-black/30 hover:!bg-white hover:!text-black 
                 !w-10 !h-10 !rounded-full !absolute !right-0 !top-1/2 !-translate-y-1/2 after:!text-lg"
          />
        </div>
      </div>
    </div>
  );
};
export default RecommendedSellers;
