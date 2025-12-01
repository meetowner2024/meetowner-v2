"use client";
import {
  MapPin,
  Home,
  IndianRupee,
  Calendar,
  Building2,
  Zap,
} from "lucide-react";
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6">
            {}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-[#1D3A76] flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-[#3A59D1] shrink-0" />
                <span className="leading-tight">
                  Popular Searches in{" "}
                  <span className="block sm:inline">{ad.title}</span>
                </span>
              </h3>
              <span className="bg-linear-to-r max-w-25 from-[#3A59D1] to-[#3D90D7] text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap">
                Quick Filters
              </span>
            </div>
            {}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {ad.filters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => handleFilterClick(f)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-md min-h-12 ${
                    i === 0
                      ? "bg-linear-to-r from-[#3A59D1] to-[#3D90D7] text-white"
                      : "bg-white text-[#1D3A76] border-2 border-gray-300 hover:border-[#3A59D1] hover:shadow-lg"
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
  }
  return null;
}
