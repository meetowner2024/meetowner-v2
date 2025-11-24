import config from "../../components/utils/config";
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
  ssr: true,
  loading: () => LoadingUI,
});
const CareersClient = dynamic(
  () => import("../../components/footer-links/CareersClient"),
  {
    ssr: true,
    loading: () => LoadingUI,
  }
);
async function fetchCareers() {
  try {
    const response = await fetch(`${config.awsApiUrl}/api/v1/careers`);
    if (!response.ok) {
      throw new Error("Failed to fetch careers");
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch careers:", err);
    return [];
  }
}

export default async function CareersPage() {
  const careers = await fetchCareers();

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 text-[#0f172a]">
        <span className="text-sm px-3 py-1 bg-[#f1f5f9] text-[#334155] rounded-full inline-block mb-3">
          We&apos;re hiring!
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Be part of our mission
        </h1>
        <p className="text-gray-600 mb-6">
          We&apos;re looking for passionate people to join us on our mission. We
          value flat hierarchies, clear communication, and full ownership and
          responsibility.
        </p>
        <CareersClient careers={careers} />
      </div>
      <Footer />
    </>
  );
}
