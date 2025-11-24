import dynamic from "next/dynamic";
import config from "../../components/utils/config";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const Footer = dynamic(() => import("../../components/Footer"), {
  ssr: true,
  loading: () => LoadingUI,
});
const Header = dynamic(() => import("../../components/Header"), {
  ssr: true,
  loading: () => LoadingUI,
});
const TermsClient = dynamic(
  () => import("../../components/footer-links/TermsClient"),
  {
    loading: () => LoadingUI,
  }
);

async function fetchTerms() {
  try {
    const response = await fetch(`${config.awsApiUrl}/api/v1/terms`, {
      cache: "force-cache",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch terms and conditions");
    }
    const data = await response.json();
    return data[0]?.description || "";
  } catch (err) {
    console.error("Failed to fetch terms:", err);
    return "";
  }
}

export default async function TermsPage() {
  const termsHtml = await fetchTerms();

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col relative top-10 items-center justify-center">
        <h2 className="text-xl font-bold">Terms and Conditions</h2>
        <TermsClient termsHtml={termsHtml} />
      </div>
      <Footer />
    </>
  );
}
