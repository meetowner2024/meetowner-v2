import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
export default async function SubTypeSitemap({ params }) {
  const { purpose, city, subType } = await params;
  const formattedSubType = subType
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedPropertyFor = purpose === "Sell" ? "Sell" : "Rent";
  const response = await fetch(
    `http://localhost:5000/listings/v1/getPropertiesByCityAndSubType?city=${city}&sub_type=${encodeURIComponent(
      formattedSubType
    )}&property_for=${formattedPropertyFor}`,
    { next: { revalidate: 86400 } }
  );
  if (!response.ok) {
    return notFound();
  }
  const { data } = await response.json();
  return (
    <div className="space-y-6 ">
      <h1 className="text-lg  font-bold text-gray-500 tracking-tight">
        {formattedSubType} for {purpose} in {city.replace(/-/g, " ")}
      </h1>
      {data.length > 0 ? (
        data.map((locationData) => (
          <section key={locationData.location} className="space-y-1">
            <h2 className="text-md font-bold text-gray-500">
              {locationData.location.replace(/-/g, " ").toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {locationData.properties.map((property) => (
                <Link
                  key={property.unique_property_id}
                  href={`/property?${encodeURIComponent(
                    property.property_name
                  )}_in_${locationData.location}_Id_${
                    property.unique_property_id
                  }`}
                  className="inline-block"
                >
                  <p className="text-sm sm:text-base font-medium text-gray-500 hover:text-indigo-800 transition-colors">
                    {property.property_in}{" "}
                    {property.sub_type.replace(/-/g, " ").toUpperCase()} For{" "}
                    {property.property_for} In {locationData.location}
                  </p>
                </Link>
              ))}
            </div>

            <Separator className="my-4" />
          </section>
        ))
      ) : (
        <p className="text-gray-600 text-center">No properties found.</p>
      )}
    </div>
  );
}
export async function generateStaticParams() {
  const response = await fetch(
    "http://localhost:5000/listings/v1/getSitemapData"
  );
  if (!response.ok) {
    console.error("Failed to fetch sitemap data:", response.status);
    return [];
  }
  const { sitemap } = await response.json();
  return sitemap.flatMap((cityData) => {
    const citySlug = cityData.city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const rentPaths = cityData.Rent.subTypes.map((subType) => ({
      purpose: "Rent",
      city: citySlug,
      subType: subType.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));
    const salePaths = cityData.Sell.subTypes.map((subType) => ({
      purpose: "Sell",
      city: citySlug,
      subType: subType.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));
    return [...rentPaths, ...salePaths];
  });
}
export const revalidate = 86400;
