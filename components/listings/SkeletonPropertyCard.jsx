import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const SkeletonPropertyCard = () => {
  return (
    <div className="flex flex-col  items-center p-4 rounded-2xl shadow-md bg-white w-full animate-pulse">
      <div className="w-full flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[400px]">
          <div className="w-full h-50 bg-gray-200 rounded-md" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="mb-3 text-left">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="flex items-center gap-2 my-2 md:my-0">
                <div className="w-7 h-7 bg-gray-200 rounded-2xl" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
          <div className="mb-4 flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-2 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 sm:justify-start justify-between w-full">
              <div className="flex justify-between items-center w-full sm:w-auto">
                <div className="flex gap-1 items-center">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-24 sm:hidden" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 hidden sm:block" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="h-10 bg-gray-200 rounded-full w-24" />
              <div className="h-10 bg-gray-200 rounded-full w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SkeletonPropertyCard;
