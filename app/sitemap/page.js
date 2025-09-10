import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
export default async function SitemapPage() {
  const response = await fetch(
    "http://localhost:5000/listings/v1/getSitemapData",
    {
      next: { revalidate: 86400 },
    }
  );
  const { sitemap } = response.ok ? await response.json() : { sitemap: [] };
  return (
    <div className="space-y-2">
      {}
      <section className="py-2">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Static Pages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6">
          {[
            { href: "/", label: "Home" },
            { href: "/listings", label: "Listings" },
            { href: "/property", label: "Property" },
            { href: "/favourites", label: "Favourites" },
            { href: "/pre-launch", label: "Pre-Launch" },
            { href: "/about", label: "About" },
            { href: "/services", label: "Services" },
            { href: "/terms", label: "Terms" },
            { href: "/privacy", label: "Privacy" },
          ].map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="text-gray-600 hover:text-black hover:underline text-sm"
            >
              {page.label}
            </Link>
          ))}
        </div>
      </section>
      <Separator />
      {}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Properties for Rent
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sitemap.map(
            (cityData) =>
              cityData.Rent.subTypes.length > 0 && (
                <Card
                  key={`${cityData.city}-Rent`}
                  className="hover:shadow-xl transition-shadow border-gray-400"
                >
                  <CardHeader>
                    <CardTitle>
                      <Link
                        href={`/sitemap/Rent/${cityData.city}`}
                        className="text-black hover:underline"
                      >
                        Flats for rent in {cityData.city}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cityData.Rent.subTypes.map((subType) => (
                        <li key={`${cityData.city}-Rent-${subType}`}>
                          <Link
                            href={`/sitemap/Rent/${cityData.city}/${subType}`}
                            className="text-sm sm:text-base font-medium text-gray-500 hover:text-blue-600 hover:underline"
                          >
                            {subType.toUpperCase()} for rent in {cityData.city}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
          )}
        </div>
      </section>
      <Separator />
      {}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Properties for Sale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sitemap.map(
            (cityData) =>
              cityData.Sell.subTypes.length > 0 && (
                <Card
                  key={`${cityData.city}-Sell`}
                  className="hover:shadow-xl transition-shadow border-gray-400"
                >
                  <CardHeader>
                    <CardTitle>
                      <Link
                        href={`/sitemap/Sell/${cityData.city}`}
                        className="text-black hover:underline"
                      >
                        Properties for sale in {cityData.city}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cityData.Sell.subTypes.map((subType) => (
                        <li key={`${cityData.city}-Sell-${subType}`}>
                          <Link
                            href={`/sitemap/Sell/${cityData.city}/${subType}`}
                            className="text-sm sm:text-base font-medium text-gray-500 hover:text-blue-600 hover:underline"
                          >
                            {subType.toUpperCase()} for sale in {cityData.city}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
          )}
        </div>
      </section>
    </div>
  );
}
export const revalidate = 86400;
