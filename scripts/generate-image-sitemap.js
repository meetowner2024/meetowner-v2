const { SitemapStream, streamToPromise } = require("sitemap");
const fs = require("fs");
const path = require("path");
async function generateImageSitemap() {
  try {
    const response = await fetch(
      "https://api.meetowner.in/adAssets/v1/getSeoImages"
    );
    if (!response.ok) {
      throw new Error(`API fetch failed: ${response.status}`);
    }
    const { data } = await response.json();
    const smStream = new SitemapStream({
      hostname: "https://meetowner.in",
      xmlns: {
        image: true,
      },
    });
    data.forEach((property) => {
      smStream.write({
        url: property.seo_url,
        img: [
          {
            url: property.image,
            title: property.property_name,
            caption: `${property.property_name} - ${property.sub_type} for ${property.property_for} in ${property.location_id}`,
          },
        ],
      });
    });
    smStream.end();
    const dataXml = await streamToPromise(smStream);
    const outputPath = path.join(
      __dirname,
      "..",
      "public",
      "sitemap-images.xml"
    );
    fs.writeFileSync(outputPath, dataXml.toString());
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    process.exit(1);
  }
}
generateImageSitemap();
