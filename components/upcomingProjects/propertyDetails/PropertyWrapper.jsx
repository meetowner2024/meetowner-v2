import { useEffect, useState } from "react";

import axios from "axios";
import PropertyDetails from "./PropertyDetails";
import Header from "../../components/Header";
import QuickLinks from "./QuickLinks";
import config from "../../../config";
import { useParams, useSearchParams } from "next/navigation";
export default function PropertyWrapper() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [mainFloorPlan, setMainFloorPlan] = useState("");
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const fetchPropertyData = async () => {
      const id = propertyId || searchParams.get("property_id_");

      if (!id) {
        setError("No property ID provided in the URL");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${config.awsApiUrl}/upcoming/v1/getProjectById?unique_property_id=${id}`
        );
        const data = response.data;
        if (response.status === 200 && data.data) {
          setProperty(data.data);
          setMainImage(data.data.gallery_images[0]?.image || "");
          setMainFloorPlan(data.data.sizes[0]?.floor_plan || "");
        } else {
          throw new Error("Invalid property data received");
        }
      } catch (err) {
        setError(err.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [propertyId, searchParams]);
  return (
    <>
      <Header />
      <div className="w-full flex flex-col lg:flex-row mt-5 px-4 sm:px-6 lg:px-8 gap-6">
        <div className="w-full lg:w-3/4">
          <PropertyDetails
            property={property}
            loading={loading}
            error={error}
            mainImage={mainImage}
            mainFloorPlan={mainFloorPlan}
            setMainFloorPlan={setMainFloorPlan}
            setMainImage={setMainImage}
          />
        </div>
        <div className="w-full lg:w-1/4">
          <QuickLinks />
        </div>
      </div>
    </>
  );
}
