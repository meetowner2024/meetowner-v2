import { Filter, X } from "lucide-react";

export const Filters = ({
  filters,
  setFilters,
  clearFilters,
  selectedCategory,
  setSelectedCategory,
  setShowFilters,
}) => {
  const toggleBHKFilter = (bhk) => {
    setFilters((prev) => ({
      ...prev,
      bhk: prev.bhk.includes(bhk)
        ? prev.bhk.filter((b) => b !== bhk)
        : [...prev.bhk, bhk],
    }));
  };

  const togglePropertyTypeFilter = (type) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter((t) => t !== type)
        : [...prev.propertyType, type],
    }));
  };

  const togglePropertyInFilter = (type) => {
    setSelectedCategory(type);
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-700" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Filters
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Property In
          </h3>
          <div className="space-y-2">
            {["Residential", "Commercial"].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="propertyIn"
                  value={type}
                  checked={type === selectedCategory}
                  onChange={() => togglePropertyInFilter(type)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            {[
              { key: "newLaunch", label: "New Launch" },
              { key: "reraRegistered", label: "RERA Registered" },
              { key: "readyToMove", label: "Ready to Move" },
              { key: "underConstruction", label: "Under Construction" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={(e) =>
                    setFilters({ ...filters, [key]: e.target.checked })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Budget (₹ Cr)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minPrice: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxPrice: Number(e.target.value) || 15,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={filters.maxPrice || 15}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: Number(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Bedrooms</h3>
          <div className="grid grid-cols-3 gap-2">
            {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6+ BHK"].map(
              (bhk) => (
                <button
                  key={bhk}
                  onClick={() => toggleBHKFilter(bhk)}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    filters.bhk.includes(bhk)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300"
                  }`}
                >
                  {bhk}
                </button>
              )
            )}
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Property Type
          </h3>
          <div className="space-y-2">
            {["Apartment", "Villa", "Independent House", "Studio"].map(
              (type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.propertyType.includes(type)}
                    onChange={() => togglePropertyTypeFilter(type)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              )
            )}
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
          <input
            type="text"
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Builder</h3>
          <input
            type="text"
            placeholder="Enter builder name"
            value={filters.builder}
            onChange={(e) =>
              setFilters({ ...filters, builder: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};
