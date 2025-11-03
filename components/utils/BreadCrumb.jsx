import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import Link from "next/link";

const Breadcrumb = ({ title }) => {
  const pathname = usePathname();
  const pathnames = pathname.split("/").filter((x) => x);
  const propertyData = useSelector((state) => state.property);
  const searchData = useSelector((state) => state.search);
  const routeNames = {
    "": "Home",
    login: "Login",
    careers: "Careers",
    services: "Services",
    terms: "Terms & Conditions",
    favourites: "Favourites",
    about: "About",
    privacy: "Privacy & Policies",
    profile: "Profile",
  };
  const truncate = (str, max = 30) =>
    str && str.length > max ? `${str.slice(0, max - 3)}...` : str;
  let crumbs = [];
  const slugify = (value) =>
    value
      ?.toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "";
  const buildListingsSeoUrl = (data) => {
    const city = slugify(data.city || "all");
    const location = slugify(data.location || "all");
    const propertyIn = slugify(data.property_in || "all");
    const bhk = data.bhk ? `${data.bhk}-bhk` : "all";
    const forType = data.tab?.toLowerCase() === "rent" ? "rent" : "sale";
    return `/listings/${city}/${location}/${propertyIn}/${bhk}/${forType}`;
  };
  const hasPropertyData = propertyData?.location && propertyData?.propertyName;
  if (pathnames.includes("property") && hasPropertyData) {
    const citySlug = slugify(propertyData.city || searchData?.city);
    const locationSlug = slugify(propertyData.location);
    const propertyUrl = buildListingsSeoUrl({
      city: propertyData.city,
      location: propertyData.location,
      property_in: propertyData.property_in,
      bhk: propertyData.bedrooms,
      tab: propertyData.property_for === "Rent" ? "Rent" : "Buy",
    });
    crumbs = [
      { name: "Home", path: "/" },
      { name: "Properties", path: "/listings" },
      { name: propertyData.city, path: `/listings/${citySlug}` },
      {
        name: propertyData.location,
        path: `/listings/${citySlug}/${locationSlug}`,
      },
      { name: propertyData.propertyName, path: pathname },
    ];
  } else if (pathnames.includes("property")) {
    const citySlug = slugify(searchData?.city);
    crumbs = [
      { name: "Home", path: "/" },
      { name: "Properties", path: "/listings" },
      { name: searchData?.city || "", path: `/listings/${citySlug}` },
      { name: "Property", path: pathname },
    ];
  } else if (pathnames.includes("listings")) {
    const citySlug = slugify(searchData?.city);
    const locationSlug = slugify(searchData?.location);
    crumbs = [
      { name: "Home", path: "/" },
      { name: "Properties", path: "/listings" },
      { name: searchData?.city || "", path: `/listings/${citySlug}` },
      searchData?.location
        ? {
            name: searchData.location,
            path: `/listings/${citySlug}/${locationSlug}`,
          }
        : null,
    ].filter(Boolean);
} else if (pathnames[0] === "blogs" && pathnames[1] && title) {
    crumbs = [
      { name: "Home", path: "/" },
      { name: "Blogs", path: "/blogs" },
      { name: truncate(title), path: pathname },
    ];
  } else {
    crumbs = [
      { name: "Home", path: "/" },
      ...pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        return {
          name:
            routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1),
          path: to,
        };
      }),
    ];
  }
  crumbs = crumbs.filter((crumb) => crumb.name && crumb.name.trim() !== "");
  return (
    <nav
      className="flex items-center py-1 px-5 bg-white text-gray-700 "
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2  overflow-x-auto whitespace-nowrap scrollbar-hidden  ">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index < crumbs.length - 1 ? (
              <>
                <Link
                  href={crumb.path}
                  className="text-blue-900 hover:text-blue-900 text-sm font-medium"
                >
                  {crumb.name}
                </Link>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              </>
            ) : (
              <span className="text-gray-500 text-sm font-medium">
                {crumb.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
export default Breadcrumb;
