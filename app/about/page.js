import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const Header = dynamic(() => import("../../components/Header"), {
  ssr: true,
  loading: () => LoadingUI,
});
const Footer = dynamic(() => import("../../components/Footer"), {
  loading: () => LoadingUI,
});
const AboutClient = dynamic(
  () => import("../../components/footer-links/AboutClient"),
  { loading: () => LoadingUI }
);
import config from "../../components/utils/config";
async function fetchAbout() {
  try {
    const response = await fetch(`${config.awsApiUrl}/api/v1/about`, {
      cache: "force-cache",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch about info");
    }
    const data = await response.json();
    return Array.isArray(data) && data.length > 0
      ? data[0].description || ""
      : "";
  } catch (err) {
    console.error("Failed to fetch about:", err);
    return "";
  }
}
export default async function AboutPage() {
  const aboutHtml = await fetchAbout();
  return (
    <>
      <Header />
      <div className="flex flex-col my-10 w-[70%] mx-auto justify-center gap-4">
        <h2 className="text-2xl font-bold mb-4">About Us</h2>
        <AboutClient aboutHtml={aboutHtml} />
      </div>
      <Footer />
    </>
  );
}
