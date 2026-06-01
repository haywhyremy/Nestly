export function SegmentedToggle({
  options = [],
  value,
  onChange,
  accentColor = 'bg-accent-sage'
}) {
  return (
    <div
      role="radiogroup"
      className="flex w-full bg-[#F2EDE6] dark:bg-[#131110] rounded-xl p-1 gap-1 select-none"
    >
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={`flex-1 h-12 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              isActive
                ? `${accentColor} text-white shadow-sm`
                : 'bg-transparent text-[#1F1B16] dark:text-[#F0ECE6] active:bg-[#F2EDE6]/20 hover:text-[#1F1B16] dark:hover:text-[#F0ECE6]'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedToggle;
