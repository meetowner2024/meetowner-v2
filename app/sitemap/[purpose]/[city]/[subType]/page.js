import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
export default async function SubTypeSitemap({ params }) {
  const { purpose, city, subType } = params;
  const formattedSubType = subType.replace(/-/g, " ");
  const formattedPropertyFor = purpose === "Sell" ? "Sell" : "Rent";
  const response = await fetch(
    `https://api.meetowner.in/listings/v1/getPropertiesByCityAndSubType?city=${city}&sub_type=${encodeURIComponent(
      formattedSubType
    )}&property_for=${formattedPropertyFor}`
  );
  if (!response.ok) return notFound();
  const { data } = await response.json();
  const slugify = (text) =>
    text
      ?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const uniquePropertiesByLocation = {};
  data.forEach((locationData) => {
    const locationSlug = slugify(locationData.location);
    if (!uniquePropertiesByLocation[locationSlug]) {
      uniquePropertiesByLocation[locationSlug] = [];
    }
    locationData.properties.forEach((property) => {
      const isApartment = property.sub_type?.toLowerCase() === "apartment";
      const bedroomsText =
        isApartment && property.bhk ? `${property.bhk}-bhk-` : "";
      const facingText = property.facing
        ? `${slugify(property.facing)}-facing-`
        : "";
      const propertyType = slugify(property.sub_type);
      const propertyForSlug =
        property.property_for === "Sell" ? "sale" : "rent";
      const seoSlug = `${bedroomsText}${propertyType}-${facingText}for-${propertyForSlug}-in-${locationSlug}-${slugify(
        property.property_name
      )}`;
      const url = `/property?${seoSlug}_Id_${property.unique_property_id}`;
      if (
        !uniquePropertiesByLocation[locationSlug].some((p) => p.url === url)
      ) {
        uniquePropertiesByLocation[locationSlug].push({
          url,
          name: property.property_in,
          property_name: property.property_name,
          subType: property.sub_type,
          bhk: property.bhk,
          facing: property.facing,
        });
      }
    });
  });
  let headingText = formattedSubType;
  const firstLocation = Object.values(uniquePropertiesByLocation)[0];
  if (firstLocation && firstLocation.length > 0) {
    const firstProperty = firstLocation[0];
    if (
      firstProperty.subType.toLowerCase() === "apartment" &&
      firstProperty.bhk
    ) {
      headingText = `${firstProperty.bhk} BHK ${formattedSubType}`;
    }
    if (firstProperty.facing) {
      headingText += ` ${firstProperty.facing} Facing`;
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-gray-500 tracking-tight">
        {headingText} for {purpose === "Sell" ? "Sale" : "Rent"} in{" "}
        {city.replace(/-/g, " ")}
      </h1>
      {Object.entries(uniquePropertiesByLocation).map(
        ([locationSlug, properties]) => (
          <section key={locationSlug} className="space-y-1">
            <h2 className="text-md font-bold text-gray-500">
              {locationSlug.replace(/-/g, " ").toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {properties.map((property) => (
                <Link
                  key={property.url}
                  href={property.url}
                  className="inline-block"
                >
                  <p className="text-sm sm:text-base font-medium text-gray-500 hover:text-indigo-800 transition-colors">
                    {property.bhk ? `${property.bhk} BHK ` : ""}
                    {property.subType.replace(/-/g, " ").toUpperCase()}{" "}
                    {property.facing ? `${property.facing} Facing ` : ""}
                    {property.name} for {purpose === "Sell" ? "Sale" : "Rent"}{" "}
                    in {locationSlug.replace(/-/g, " ")} -{" "}
                    {property.property_name}
                  </p>
                </Link>
              ))}
            </div>
            <Separator className="my-4" />
          </section>
        )
      )}
    </div>
  );
}
