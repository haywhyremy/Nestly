export default function GlanceSkeleton() {
  return (
    <div className="text-center py-6 w-full animate-pulse">
      {/* Hero section skeleton */}
      <div className="space-y-3 flex flex-col items-center">
        {/* "LAST FEED" label placeholder */}
        <div className="h-3 w-20 rounded-full bg-[#F2EDE6] dark:bg-[#242220]" />
        
        {/* Big time number placeholder */}
        <div className="h-14 w-40 rounded-2xl bg-[#F2EDE6] dark:bg-[#242220]" />
        
        {/* Sub-line placeholder */}
        <div className="h-4 w-28 rounded-full bg-[#F2EDE6] dark:bg-[#242220]" />
      </div>
      
      {/* Secondary rows skeleton */}
      <div className="mt-8 space-y-3 w-full px-6">
        {/* Nappy row */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#F2EDE6] dark:bg-[#242220]" />
          <div className="h-3 w-48 rounded-full bg-[#F2EDE6] dark:bg-[#242220]" />
        </div>
        
        {/* Sleep row */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#F2EDE6] dark:bg-[#242220]" />
          <div className="h-3 w-40 rounded-full bg-[#F2EDE6] dark:bg-[#242220]" />
        </div>
      </div>
    </div>
  );
}
