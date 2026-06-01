import { format } from 'date-fns'
import { Clock } from 'lucide-react'

export function TimePicker({
  value,
  onChange,
  label = 'Now'
}) {
  const now = new Date()
  const diff = Math.abs(now.getTime() - new Date(value).getTime())
  const isNow = diff <= 60000 // 60 seconds

  const displayLabel = isNow ? label : format(new Date(value), 'HH:mm')
  const formattedInputVal = format(new Date(value), "yyyy-MM-dd'T'HH:mm")

  const handleInputChange = (e) => {
    if (e.target.value) {
      onChange(new Date(e.target.value))
    }
  }

  return (
    <div className="flex items-center justify-between w-full py-3 select-none">
      <div className="flex items-center">
        <Clock size={20} strokeWidth={1.75} className="text-[#A89F94] dark:text-[#6B6259]" />
        <span className="text-base font-medium text-[#1F1B16] dark:text-[#F0ECE6] ml-2">
          {displayLabel}
        </span>
      </div>

      <input
        type="datetime-local"
        value={formattedInputVal}
        onChange={handleInputChange}
        className="bg-[#F2EDE6] dark:bg-[#131110] rounded-lg px-3 py-2 text-sm text-[#1F1B16] dark:text-[#F0ECE6] border-none focus:outline-none focus:ring-2 focus:ring-[#7A9B7E] dark:focus:ring-[#8FB393] cursor-pointer transition-all"
      />
    </div>
  )
}

export default TimePicker;
