module.exports = {
  siteUrl: "https://meetowner.in",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/api/*", "/private/*"],
  additionalPaths: async (config) => {
    const staticRoutes = [
      {
        loc: `${config.siteUrl}/`,
        lastmod: "2025-08-08",
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: `${config.siteUrl}/listings`,
        lastmod: "2025-08-08",
        changefreq: "daily",
        priority: 0.9,
      },
      {
        loc: `${config.siteUrl}/property`,
        lastmod: "2025-08-08",
        changefreq: "daily",
        priority: 0.85,
      },
      {
        loc: `${config.siteUrl}/favourites`,
        lastmod: "2025-08-08",
        changefreq: "daily",
        priority: 0.7,
      },
      {
        loc: `${config.siteUrl}/pre-launch`,
        lastmod: "2025-08-08",
        changefreq: "daily",
        priority: 0.8,
      },
      {
        loc: `${config.siteUrl}/about`,
        lastmod: "2025-08-08",
        changefreq: "monthly",
        priority: 0.75,
      },
      {
        loc: `${config.siteUrl}/services`,
        lastmod: "2025-08-08",
        changefreq: "monthly",
        priority: 0.75,
      },
      {
        loc: `${config.siteUrl}/terms`,
        lastmod: "2025-08-08",
        changefreq: "monthly",
        priority: 0.6,
      },
      {
        loc: `${config.siteUrl}/privacy`,
        lastmod: "2025-08-08",
        changefreq: "monthly",
        priority: 0.6,
      },
    ];
    try {
      const response = await fetch(
        "https://api.meetowner.in/listings/v1/getAllListings"
      );
      if (!response.ok) {
        console.error("Failed to fetch properties:", response.status);
        return staticRoutes;
      }
      const data = await response.json();
      console.log("API Response:", data);
      const dynamicRoutes = data.properties
        .filter(
          (property) =>
            property.sub_type && property.property_for && property.city_id
        )
        .map((property) => {
          const citySlug = property.city_id
            ? property.city_id
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/(^_|_$)/g, "")
            : "unknown";
          const locationSlug = property.location_id
            ? property.location_id
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/(^_|_$)/g, "")
            : "";
          const loc = `/listings?${property.sub_type}_for_${
            property.property_for
          }_in_city-${citySlug}_location-${
            locationSlug ? `${locationSlug}` : ""
          }`;
          return {
            loc: `${config.siteUrl}${loc}`,
            lastmod: property.updated_date
              ? new Date(property.updated_date).toISOString()
              : new Date().toISOString(),
            changefreq: "weekly",
            priority: 0.5,
          };
        });
      return [...staticRoutes, ...dynamicRoutes];
    } catch (error) {
      console.error("Error generating sitemap paths:", error);
      return staticRoutes;
    }
  },
};
