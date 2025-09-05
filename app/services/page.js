

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import config from "../../components/utils/config";
import ServicesClient from "../../components/footer-links/ServicesClient";
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
