export function EmptyStateCard() {
  return (
    <div className="text-center py-8 select-none flex flex-col items-center justify-center animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Sage-coloured abstract minimal baby-evocative shape */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-accent-sage animate-pulse"
      >
        <circle
          cx="40"
          cy="35"
          r="20"
          stroke="#7A9B7E"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="55"
          cy="20"
          r="3"
          fill="#7A9B7E"
        />
      </svg>
      
      <h2 className="text-base font-semibold text-[#6B6259] dark:text-[#A89F94] mt-4">
        Log your first feed when you're ready.
      </h2>
      <p className="text-sm text-[#A89F94] dark:text-[#6B6259] mt-1 font-light italic">
        The day starts when you do.
      </p>
    </div>
  )
}

export default EmptyStateCard;
