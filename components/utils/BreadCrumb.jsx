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
  const hasPropertyData = propertyData?.location && propertyData?.propertyName;
  if (pathnames.includes("property") && hasPropertyData) {
    crumbs = [
      { name: "Home", path: "/" },
      { name: "Properties", path: "/listings" },
      {
        name: propertyData.location,
        path: `/listings?city=${encodeURIComponent(propertyData.location)}`,
      },
      {
        name: propertyData.propertyName,
        path: pathname,
      },
    ];
  } else if (pathnames.includes("property")) {
    crumbs = [
      { name: "Home", path: "/" },
      { name: "Properties", path: "/listings" },
      {
        name: searchData?.city || "",
        path: `/listings?city=${encodeURIComponent(searchData?.city || "")}`,
      },
      {
        name: "Property",
        path: pathname,
      },
    ];
  } else if (pathnames.includes("listings")) {
    crumbs = [
      { name: "Home", path: "/" },
      { name: "Properties", path: "/listings" },
      {
        name: searchData?.city || "",
        path: `/listings?city=${encodeURIComponent(searchData?.city || "")}`,
      },
      {
        name: searchData?.location || "",
        path: searchData?.location || "",
      },
    ];
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
