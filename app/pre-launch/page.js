import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const UpcomingProjects = dynamic(
  () => import("../../components/upcomingProjects/Upcoming"),
  {
    ssr: true,
    loading: () => LoadingUI,
  }
);
export default function UpcomingWrapper() {
  return <UpcomingProjects />;
}
