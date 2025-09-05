import { useDispatch } from "react-redux";
import { setSearchData } from "../../../store/slices/searchSlice";
import { useRouter } from "next/navigation";
const QuickLinks = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const ongoingLinks = [
    { label: "Ongoing Projects in Hitech City", location: "Hitech City" },
    { label: "Ongoing Projects in Kollur", location: "Kollur" },
    { label: "Ongoing Projects in Kokapet", location: "Kokapet" },
    { label: "Ongoing Projects in Tukkuguda", location: "Tukkuguda" },
    {
      label: "2BHK Apartments for sale in Hitech City",
      location: "Hitech City",
      sub_type: "Apartment",
      bedrooms: 2,
    },
    {
      label: "4BHK Apartments for sale in Kokapet",
      location: "Kokapet",
      sub_type: "Apartment",
      bedrooms: 4,
    },
    {
      label: "3BHK Apartments for sale in Mallampet",
      location: "Mallampet",
      sub_type: "Apartment",
      bedrooms: 3,
    },
    {
      label: "4BHK Apartments for sale in Puppalguda",
      location: "Puppalguda",
      sub_type: "Apartment",
      bedrooms: 4,
    },
    {
      label: "Independent House for sale in Hayathnagar",
      location: "Hayathnagar",
      sub_type: "Independent House",
    },
    {
      label: "Plot for sale in Vikarabad",
      location: "Vikarabad",
      sub_type: "Plot",
    },
    {
      label: "Plot for sale in Choutuppal",
      location: "Choutuppal",
      sub_type: "Plot",
    },
  ];
  const handleNavigation = (item) => {
    const searchData = {
      location: item.location,
      ...(item.sub_type && { sub_type: item.sub_type }),
      ...(item.bedrooms && { bhk: item.bedrooms }),
    };
    dispatch(setSearchData(searchData));
    router.push("/listings");
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full transition-all duration-300 hover:shadow-xl border border-gray-100">
      <h2 className="text-base sm:text-lg text-left font-bold text-gray-800 mb-3 sm:mb-4 tracking-tight">
        Explore Ongoing Projects
      </h2>
      <ul className="space-y-2 sm:space-y-3">
        {ongoingLinks.length > 0 ? (
          ongoingLinks.map((item, index) => (
            <li
              key={`ongoing-${index}`}
              className="group cursor-pointer"
              onClick={() => handleNavigation(item)}
            >
              <div className="flex items-center text-gray-600 hover:text-teal-600 text-xs sm:text-sm font-medium transition-colors duration-200 group-hover:translate-x-1 truncate">
                <span className="mr-2 text-teal-500 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                  →
                </span>
                <span className="truncate">{item.label}</span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-xs sm:text-sm">
            No ongoing projects available
          </li>
        )}
      </ul>
    </div>
  );
};
export default QuickLinks;
