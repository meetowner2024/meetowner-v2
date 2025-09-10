import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CitySitemap({ params }) {
  const { purpose, city } = params;

  const response = await fetch(
    "http://localhost:5000/listings/v1/getSitemapData",
    {
      next: { revalidate: 86400 },
    }
  );
  if (!response.ok) {
    console.error("Failed to fetch sitemap data:", response.status);
    return notFound();
  }
  const { sitemap } = await response.json();
  const cityData = sitemap.find((c) => c.city === city);

  if (!cityData) {
    return notFound();
  }

  const subTypes = cityData[purpose]?.subTypes || [];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>
        Properties for {purpose} in {city.replace(/-/g, " ")}
      </h1>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {subTypes.map((subType) => (
          <li key={subType}>
            <Link href={`/sitemap/${purpose}/${city}/${subType}`}>
              {subType.replace(/-/g, " ").toUpperCase()} for {purpose} in{" "}
              {city.replace(/-/g, " ")}
            </Link>
          </li>
        ))}
      </ul>
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
    const citySlug = cityData.city.replace(/[^a-z0-9]+/g, "-");
    return ["Rent", "Sell"].map((purpose) => ({
      purpose,
      city: citySlug,
    }));
  });
}

export const revalidate = 86400; // Revalidate every 24 hours
