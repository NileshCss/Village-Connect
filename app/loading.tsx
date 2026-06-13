export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
