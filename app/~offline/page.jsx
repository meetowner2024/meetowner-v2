"use client";
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        You are currently offline
      </h1>
      <p className="text-gray-600 mb-6">
        Please check your internet connection. You can still browse pages you have visited previously.
      </p>
    </div>
  );
}
