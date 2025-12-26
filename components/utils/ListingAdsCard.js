"use client";
import {
  MapPin,
  Home,
  IndianRupee,
  Calendar,
  Building2,
  Zap,
  ChevronRight,
  UploadCloud,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useDispatch } from "react-redux";
import {
  setBHK,
  setBudget,
  setOccupancy,
  setSubType,
  setSearchData,
} from "../store/slices/searchSlice";
import React from "react";
export default function ListingAdsCard({ ad, onApplyFilters }) {
  const dispatch = useDispatch();
  if (ad.ad_type === "popular_filters") {
    const handleFilterClick = (filter) => {
      if (filter.type === "location")
        dispatch(setSearchData({ location: filter.value }));
      else if (filter.type === "bhk") dispatch(setBHK(filter.value));
      else if (filter.type === "budget") dispatch(setBudget(filter.value));
      else if (filter.type === "occupancy")
        dispatch(setOccupancy(filter.value));
      else if (filter.type === "subtype") dispatch(setSubType(filter.value));
      onApplyFilters?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const getIcon = (type) => {
      const icons = {
        bhk: Home,
        budget: IndianRupee,
        occupancy: Calendar,
        subtype: Building2,
      };
      const Icon = icons[type] || MapPin;
      return <Icon className="w-4 h-4 shrink-0" />;
    };
    return (
      <div className="my-4 sm:my-6 px-4 sm:px-0">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative group">
          {}
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-blue-50 to-transparent rounded-full -mr-32 -mt-32 opacity-50 z-0 pointer-events-none" />
          <div className="p-4 sm:p-6 relative z-10">
            {}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-[#1D3A76] flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-[#3A59D1] shrink-0 fill-[#3A59D1]/10" />
                <span className="leading-tight">
                  Popular Searches in{" "}
                  <span className="block sm:inline">{ad.title}</span>
                </span>
              </h3>
              <span className="bg-linear-to-r max-w-28 from-[#3A59D1] to-[#3D90D7] text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap shadow-md shadow-blue-500/20">
                Quick Filters
              </span>
            </div>
            {}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {ad.filters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => handleFilterClick(f)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 shadow-sm min-h-12 border ${
                    i === 0
                      ? "bg-linear-to-r from-[#3A59D1] to-[#3D90D7] text-white border-transparent shadow-blue-500/20 hover:shadow-blue-500/30"
                      : "bg-white text-[#1D3A76] border-gray-200 hover:border-[#3A59D1] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {getIcon(f.type)}
                  <span className="truncate">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (ad.ad_type === "seller_promotion") {
    return (
      <div className="my-6 px-4 sm:px-0">
        <div className="bg-linear-to-br from-[#1D3A76] to-[#0F224A] rounded-2xl shadow-xl overflow-hidden relative text-white">
          {}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3A59D1]/20 rounded-full blur-2xl -ml-20 -mb-20"></div>
          <div className="p-6 sm:p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-blue-100 mb-3 border border-white/10">
                <Building2 className="w-3.5 h-3.5" />
                <span>For Property Owners</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
                List Your Property for{" "}
                <span className="text-[#4FACFE]">Free!</span>
              </h3>
              <p className="text-blue-100/80 mb-6 max-w-lg mx-auto md:mx-0 text-sm sm:text-base">
                Join thousands of owners on MeetOwner. Get verified leads,
                manage viewings, and close deals faster with our advanced Seller
                Panel.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="https://sellers.meetowner.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#3A59D1] hover:bg-[#2d46a8] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70 hover:-translate-y-0.5"
                >
                  Go to Seller Panel
                  <ChevronRight className="w-4 h-4" />
                </a>
                <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-200">Starting at</span>
                    <span className="font-bold">₹0 / month</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0 relative hidden md:block">
              {}
              <div className="w-32 h-32 bg-linear-to-tr from-[#3A59D1] to-[#4FACFE] rounded-2xl rotate-3 flex items-center justify-center shadow-2xl border border-white/10">
                <UploadCloud className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white text-[#1D3A76] rounded-xl -rotate-6 flex flex-col items-center justify-center shadow-lg p-2">
                <Zap className="w-8 h-8 mb-1 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-center leading-tight">
                  Fast
                  <br />
                  Selling
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (ad.ad_type === "app_download") {
    const playStoreUrl =
      "https://play.google.com/store/apps/details?id=com.meetowner.app&pcampaignid=web_share";
    const appStoreUrl = "https://apps.apple.com/us/app/meetowner/id6743744178";
    const appUrl = "https://meetowner.in/app";
    return (
      <div className="my-6 px-4 sm:px-0">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full bg-linear-to-r from-blue-50/50 to-transparent pointer-events-none"></div>
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 relative z-10">
            {}
            <div className="shrink-0 relative group">
              <div className="w-32 h-32 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 flex items-center justify-center border border-gray-100 rotate-0 sm:-rotate-3 transition-transform group-hover:rotate-0 duration-300">
                <QRCodeSVG value={appUrl} size={110} />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-[#3A59D1] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
                Scan Me
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1D3A76] mb-2">
                Take MeetOwner With You
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto sm:mx-0 text-sm">
                Download our mobile app to search properties, chat with owners,
                and get instant notifications on the go.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <button
                  onClick={() => window.open(appStoreUrl, "_blank")}
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md"
                >
                  <svg
                    viewBox="0 0 384 512"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-22-101.7-54-101.7-91.9zm-55.6-203c20.3-24.2 32.8-54.6 27.2-85.7-27.5 4.9-57.9 20.6-77 42.6-18.2 21.4-31.9 50.1-27 79 30.6 3.7 60.1-13.6 76.8-35.9z" />
                  </svg>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-80">
                      Download on the
                    </span>
                    <span className="text-sm font-bold">App Store</span>
                  </div>
                </button>
                <button
                  onClick={() => window.open(playStoreUrl, "_blank")}
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md"
                >
                  <svg
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-221.3L58.1 278.2 104.6 499z" />
                  </svg>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-80">GET IT ON</span>
                    <span className="text-sm font-bold">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
