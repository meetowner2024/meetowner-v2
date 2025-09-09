// app/manifest.js
export default function manifest() {
  return {
    name: "Meet Owner",
    short_name: "MeetOwner",
    description:
      "Buy, sell, or rent properties in Hyderabad directly with owners. Discover premium apartments, villas, and plots.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/logoicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/playstore.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/playstore.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
