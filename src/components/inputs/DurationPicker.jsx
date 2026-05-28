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
      <span className="block text-sm font-semibold text-ink-secondary uppercase tracking-wider mb-2">
        Duration
      </span>
      <div className="flex items-center justify-center gap-6 bg-surface-raised border border-surface-sunken p-4 rounded-xl">
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

        <div className="text-xl font-light text-ink-tertiary">:</div>

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
