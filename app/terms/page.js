

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import config from "../../components/utils/config";
import  TermsClient  from "../../components/footer-links/TermsClient";


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
