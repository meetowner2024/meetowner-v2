import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
export const QuickView = ({ properties, setShowQuickView }) => {

  const router = useRouter();

  const handleCardClick = (property) => {
    router.push(`/new-launch/${property.unique_property_id}`);
  };
  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quick View</h3>
          <button
            aria-label="Close"
            onClick={() => setShowQuickView(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {properties.length} properties on this page
        </p>
      </div>
      <div className="overflow-y-auto h-full pb-20">
        {properties.map((property) => (
          <div
            key={property.unique_property_id}
            className="p-4 border-b hover:bg-gray-50 cursor-pointer"
            onClick={() => handleCardClick(property)}
          >
            <div className="flex space-x-3">
              <Image
                
                width={600}
                height={400}
                src={`https://api.meetowner.in/assets/v1/serve/${property?.gallery_images[0]?.image}`}
                alt={property.property_name}
                crossOrigin="anonymous"
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1 min-w-0 items-start justify-items-start">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {property.property_name}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {`${property.location}, ${property.city}`}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {property.sizes?.length
                    ? `${(
                        (parseFloat(property.sizes[0].sqft_price) *
                          parseFloat(property.sizes[0].buildup_area)) /
                        10000000
                      ).toFixed(2)} Cr`
                    : "Price on Request"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
