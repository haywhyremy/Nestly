import { Stepper } from './Stepper'

export function DurationPicker({
  value = 0,
  onChange,
  maxHours = 3
}) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60

  const handleHoursChange = (newHours) => {
    const newTotal = newHours * 60 + minutes
    onChange(newTotal)
  }

  const handleMinutesChange = (newMinutes) => {
    const newTotal = hours * 60 + newMinutes
    onChange(newTotal)
  }

  return (
    <div className="w-full select-none">
      <span className="block text-xs font-medium text-[#6B6259] dark:text-[#A89F94] uppercase tracking-wider mb-2">
        Duration
      </span>
      <div className="flex items-center justify-center gap-6 bg-[#FFFFFF] dark:bg-[#242220] border border-[#F2EDE6] dark:border-[#131110] p-4 rounded-xl">
        <div className="flex flex-col items-center gap-1">
          <Stepper
            value={hours}
            onChange={handleHoursChange}
            min={0}
            max={maxHours}
            step={1}
            unit="h"
          />
        </div>

        <div className="text-xl font-medium text-[#1F1B16] dark:text-[#F0ECE6]">:</div>

        <div className="flex flex-col items-center gap-1">
          <Stepper
            value={minutes}
            onChange={handleMinutesChange}
            min={0}
            max={55}
            step={5}
            unit="m"
          />
        </div>
      </div>
    </div>
  )
}

export default DurationPicker;
