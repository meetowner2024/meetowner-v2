import config from "../../components/utils/config";
import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const ServicesClient = dynamic(
  () => import("../../components/footer-links/ServicesClient"),
  {
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
async function fetchServices() {
  try {
    const response = await fetch(`${config.awsApiUrl}/api/v1/services`, {
      cache: "force-cache",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch services");
    }
    const data = await response.json();
    return data[0] || { description: "" };
  } catch (err) {
    console.error("Failed to fetch services:", err);
    return { description: "" };
  }
}

export default async function ServicesPage() {
  const services = await fetchServices();
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col relative top-10 items-center">
        <h2 className="text-xl font-bold">Our Services</h2>
        <ServicesClient services={services} />
      </div>
      <Footer />
    </>
  );
}
