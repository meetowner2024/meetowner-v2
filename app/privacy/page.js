import config from "../../components/utils/config";
import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const PrivacyClient = dynamic(
  () => import("../../components/footer-links/PrivacyClient"),
  {
    ssr: true,
    loading: () => LoadingUI,
  }
);
const Footer = dynamic(() => import("../../components/Footer"), {
  ssr: true,
  loading: () => LoadingUI,
});
const Header = dynamic(() => import("../../components/Header"), {
  ssr: true,
  loading: () => LoadingUI,
});
async function fetchPrivacy() {
  try {
    const response = await fetch(`${config.awsApiUrl}/api/v1/privacy`, {
      cache: "force-cache",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch privacy policy");
    }
    const data = await response.json();
    return data[0]?.description || "";
  } catch (err) {
    console.error("Failed to fetch privacy:", err);
    return "";
  }
}

export default async function PrivacyPage() {
  const privacyHtml = await fetchPrivacy();

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col relative top-10 items-center justify-center">
        <h2 className="text-xl font-bold">Privacy Policy</h2>
        <PrivacyClient privacyHtml={privacyHtml} />
      </div>
      <Footer />
    </>
  );
}
