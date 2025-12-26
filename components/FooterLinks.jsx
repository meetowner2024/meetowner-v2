import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setSearchData } from "./store/slices/searchSlice";
import config from "./utils/config";
import theme from "./utils/theme.json";
const FooterLinks = ({ basePath = "/listings" }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Buy");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${config.awsApiUrl}/api/v1/getPropertyLinks`);
        if (!res.ok) throw new Error("Failed to fetch property links");
        const data = await res.json();
        setLinks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);
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
  const handleLinkClick = (link) => {
    dispatch(
      setSearchData({
        location: link.location,
        city: link.city,
        property_for: link.property_for,
        tab: link.property_for,
        property_in: link.property_in,
        sub_type: link.sub_type,
      })
    );
    const slugify = (text) =>
      text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    const citySlug = slugify(link.city);
    const locSlug = slugify(link.location || "");
    const subTypeSlug = slugify(link.sub_type || "");
    const typeSlug =
      link.property_in?.toLowerCase() === "commercial"
        ? "commercial"
        : link.property_in?.toLowerCase() === "plot"
        ? "plot"
        : "residential";
    const forType = link.property_for === "Sell" ? "sale" : "rent";
    const inPart =
      locSlug && locSlug !== citySlug
        ? `in-${locSlug}-${citySlug}`
        : `in-${citySlug}`;
    const finalUrl = `${basePath}/${typeSlug}-${subTypeSlug}-for-${forType}-${inPart}`;
    router.push(finalUrl);
  };
  const filteredLinks = links.filter((link) => link.property_for === activeTab);
  return (
    <footer className="bg-white text-[#1D3A76] py-16 px-4">
      <div className="max-w-8xl mx-auto px-3">
        <div ref={ref} className="overflow-hidden mb-8">
          <h2
            className={`text-3xl font-bold text-gray-900 text-left flex flex-col
          ${visible ? "animate-rise" : "opacity-0 translate-y-10"}`}
          >
            <span> Explore Properties</span>
            <svg
              viewBox="0 0 120 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`w-44 h-4 mt-2 transition-all duration-1000
            ${visible ? "animate-rise delay-200" : "opacity-0 translate-y-10"}`}
            >
              <path
                d="M2 6 C20 14, 50 -6, 118 6"
                stroke="#F0AA00"
                strokeWidth="2"
                strokeLinecap="round"
                className={`${visible ? "draw-line" : ""}`}
              />
            </svg>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <p className="text-gray-500 max-w-2xl">
            Browse through our extensive list of properties categorized by
            location and type. Find exactly what you are looking for with ease.
          </p>

          <div className="flex p-1 bg-gray-100 rounded-full self-start md:self-auto">
            {["Buy", "Rent"].map((tab) => (
              <button
                key={tab}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
                className={`
                     px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                     ${
                       activeTab === tab
                         ? `${theme.button.secondary.bg} ${theme.button.secondary.text} hover:opacity-90 shadow-lg shadow-blue-900/20`
                         : "text-gray-500 hover:text-[#1D3A76]"
                     }
                   `}
              >
                Properties for {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[200px]">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D3A76]"></div>
              <p className="mt-2 text-gray-500 text-sm">
                Loading properties...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl">
              {error}
            </div>
          ) : filteredLinks?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
              No properties found for {activeTab}.
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block md:hidden">
                <Swiper
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  className="w-full"
                  style={{ paddingBottom: "50px" }}
                >
                  {Array.from({
                    length: Math.ceil(filteredLinks?.length / 6),
                  }).map((_, pageIdx) => (
                    <SwiperSlide key={pageIdx}>
                      <div className="grid grid-cols-1 gap-3 px-1">
                        {filteredLinks
                          ?.slice(pageIdx * 6, pageIdx * 6 + 6)
                          .map((link) => (
                            <a
                              key={link.id}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(link);
                              }}
                              className="block bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-white hover:text-[#1D3A76] hover:shadow-lg transition-all duration-300 px-5 py-4 rounded-2xl text-center active:scale-95"
                            >
                              {link.link_title}
                            </a>
                          ))}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredLinks.map((link) => (
                    <a
                      key={link.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link);
                      }}
                      className="group flex items-center justify-between bg-gray-50 hover:bg-white px-6 py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(29,58,118,0.15)] hover:-translate-y-1"
                    >
                      <span className="text-gray-600 font-medium text-sm group-hover:text-[#1D3A76] transition-colors truncate pr-2">
                        {link.link_title}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#F0AA00] group-hover:text-white transition-all duration-300">
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
export default FooterLinks;
