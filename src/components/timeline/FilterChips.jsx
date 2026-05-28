export function FilterChips({ options = [], value, onChange }) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto select-none no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-ink-primary text-surface-base shadow-sm'
                : 'bg-surface-sunken text-ink-secondary hover:text-ink-primary active:bg-surface-sunken/80'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default FilterChips;
