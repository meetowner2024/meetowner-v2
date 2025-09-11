module.exports = {
  siteUrl: "https://meetowner.in",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/api/*", "/lib/*", "/components/utils/useWhatsappHook.jsx"],
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
      const sitemapResponse = await fetch(
        "https://api.meetowner.in/listings/v1/getSitemapData"
      );
      if (!sitemapResponse.ok) {
        console.error("Failed to fetch sitemap data:", sitemapResponse.status);
      }
      const { sitemap } = await sitemapResponse.json();
      const dynamicRoutes = [];
      sitemap.forEach((cityData) => {
        const citySlug = cityData.city;
        ["Rent", "Sell"].forEach((purpose) => {
          if (cityData[purpose].subTypes.length > 0) {
            dynamicRoutes.push({
              loc: `${config.siteUrl}/sitemap/${purpose}/${citySlug}`,
              lastmod: new Date().toISOString(),
              changefreq: "daily",
              priority: 0.8,
            });
            cityData[purpose].subTypes.forEach((subType) => {
              dynamicRoutes.push({
                loc: `${config.siteUrl}/sitemap/${purpose}/${citySlug}/${subType}`,
                lastmod: new Date().toISOString(),
                changefreq: "weekly",
                priority: 0.7,
              });
            });
          }
        });
      });
      const listingResponse = await fetch(
        "https://api.meetowner.in/listings/v1/getSitemapListingLinks"
      );
      if (!listingResponse.ok) {
        console.error("Failed to fetch listing links:", listingResponse.status);
        return [...staticRoutes, ...dynamicRoutes];
      }
      const { links } = await listingResponse.json();
      const listingRoutes = links.map((link) => ({
        loc: link,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: 0.65,
      }));
      return [...staticRoutes, ...listingRoutes, ...dynamicRoutes];
    } catch (error) {
      console.error("Error generating sitemap paths:", error);
      return staticRoutes;
    }
  },
};
