"use client";
import React, { useState, useMemo, Suspense } from "react";
import { useSelector } from "react-redux"; // Added for Redux
import { useProperties } from "../utils/useUpcomingProperties";
import { Filters } from "./Filters";
import { PropertyList } from "./PropertyList";
import { QuickView } from "./QuickView";

import { Filter } from "lucide-react";
import Header from "../Header";

export default function Upcoming() {
  const [selectedCategory, setSelectedCategory] = useState("Residential");
  const { location, bhk, sub_type } = useSelector((state) => state.search); // Get Redux state
  const [filters, setFilters] = useState({
    newLaunch: false,
    reraRegistered: false,
    readyToMove: false,
    underConstruction: false,
    minPrice: 0,
    maxPrice: 15,
    bhk: bhk ? [`${bhk} BHK`] : [],
    propertyType: sub_type ? [sub_type] : [],
    location: location || "",
    builder: "",
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showQuickView, setShowQuickView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const { properties, loading, error } = useProperties();

  if (error) {
  }

  const clearFilters = () => {
    setFilters({
      newLaunch: false,
      reraRegistered: false,
      readyToMove: false,
      underConstruction: false,
      minPrice: 0,
      maxPrice: 15,
      bhk: [],
      propertyType: [],
      location: "",
      builder: "",
    });
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (
        !property ||
        !property.property_type ||
        property.property_type !== selectedCategory
      ) {
        return false;
      }

      // Status Filters
      if (filters.newLaunch && property.launch_type !== "Soft Launch") {
        return false;
      }
      if (filters.reraRegistered && !property.is_rera_registered) {
        return false;
      }
      if (
        filters.readyToMove &&
        property.possession_status !== "Ready to Move"
      ) {
        return false;
      }
      if (
        filters.underConstruction &&
        property.possession_status !== "Under Construction"
      ) {
        return false;
      }

      // Price Filter (in crores)
      const price =
        property.sizes?.length > 0
          ? Math.min(
              ...property.sizes.map(
                (size) =>
                  parseFloat(size?.sqft_price || 0) *
                  parseFloat(size?.buildup_area || 0)
              )
            ) / 10000000
          : 0;
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }

      // BHK Filter (assuming sizes[].bhk)
      if (filters.bhk.length > 0) {
        const bhkValues = filters.bhk.map((bhk) =>
          bhk === "6+ BHK" ? 6 : parseInt(bhk.split(" ")[0])
        );
        const propertyBHKs =
          property.sizes?.map((size) => size.bhk).filter(Boolean) || [];
        if (!propertyBHKs.some((bhk) => bhkValues.includes(bhk))) {
          return false;
        }
      }

      // Property Type Filter
      if (
        filters.propertyType.length > 0 &&
        !filters.propertyType.includes(property.sub_type)
      ) {
        return false;
      }

      // Location Filter
      if (
        filters.location &&
        (!property.location ||
          !property.location
            .toLowerCase()
            .includes(filters.location.toLowerCase()))
      ) {
        return false;
      }

      // Builder Filter
      if (
        filters.builder &&
        (!property.builder_name ||
          !property.builder_name
            .toLowerCase()
            .includes(filters.builder.toLowerCase()))
      ) {
        return false;
      }

      return true;
    });
  }, [properties, selectedCategory, filters]);

  const Loading = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600"></div>
    </div>
  );

  if (loading) return <Loading />;
  if (error) {
    return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {selectedCategory} Projects
          </h1>
          <button
            aria-label="Filters"
            onClick={() => setShowFilters(true)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div
            className={`fixed inset-x-0 bottom-0 lg:static lg:block transform transition-transform duration-300 ease-in-out z-50 lg:z-auto bg-white lg:bg-transparent shadow-lg lg:shadow-none rounded-t-xl lg:rounded-none max-h-[80vh] overflow-y-auto ${
              showFilters ? "translate-y-0" : "translate-y-full"
            } lg:translate-y-0`}
          >
            <Filters
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setShowFilters={setShowFilters}
            />
          </div>
          <div className="flex-1">
            <Suspense fallback={<Loading />}>
              <PropertyList
                selectedCategory={selectedCategory}
                properties={filteredProperties}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setShowQuickView={setShowQuickView}
              />
              {showQuickView && (
                <QuickView
                  properties={filteredProperties}
                  setShowQuickView={setShowQuickView}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
