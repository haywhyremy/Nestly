import { useEffect, useRef } from 'react'
import { Minus, Plus } from 'lucide-react'

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 500,
  step = 10,
  unit = 'ml'
}) {
  const timerRef = useRef(null)
  const intervalRef = useRef(null)
  const valueRef = useRef(value)

  // Sync value to ref to prevent stale closures in long-press callbacks
  useEffect(() => {
    valueRef.current = value
  }, [value])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const triggerVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const handleDecrement = () => {
    const currentVal = valueRef.current
    const newVal = Math.max(min, currentVal - step)
    if (newVal === min) {
      stopAction()
    }
    if (newVal !== currentVal) {
      onChange(newVal)
      triggerVibration()
    }
  }

  const handleIncrement = () => {
    const currentVal = valueRef.current
    const newVal = Math.min(max, currentVal + step)
    if (newVal === max) {
      stopAction()
    }
    if (newVal !== currentVal) {
      onChange(newVal)
      triggerVibration()
    }
  }

  const startAction = (actionFn) => {
    stopAction()
    actionFn()

    // After 500ms delay, trigger continuously every 150ms
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        actionFn()
      }, 150)
    }, 500)
  }

  const stopAction = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleMinusStart = (e) => {
    if (value <= min) return
    e.preventDefault()
    startAction(handleDecrement)
  }

  const handlePlusStart = (e) => {
    if (value >= max) return
    e.preventDefault()
    startAction(handleIncrement)
  }

  const handleActionEnd = () => {
    stopAction()
  }

  return (
    <div className="flex items-center justify-center gap-6 select-none">
      <button
        type="button"
        disabled={value <= min}
        onMouseDown={handleMinusStart}
        onMouseUp={handleActionEnd}
        onMouseLeave={handleActionEnd}
        onTouchStart={handleMinusStart}
        onTouchEnd={handleActionEnd}
        className="w-12 h-12 rounded-xl bg-[#F2EDE6] dark:bg-[#131110] flex items-center justify-center active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Decrease value"
      >
        <Minus size={20} strokeWidth={1.75} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
      </button>

      <div className="flex items-baseline justify-center min-w-[80px] text-center">
        <span
          className="text-xl font-mono tabular-nums text-[#1F1B16] dark:text-[#F0ECE6] font-semibold"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
        <span className="text-sm text-[#6B6259] dark:text-[#A89F94] ml-1 font-medium">
          {unit}
        </span>
      </div>

      <button
        type="button"
        disabled={value >= max}
        onMouseDown={handlePlusStart}
        onMouseUp={handleActionEnd}
        onMouseLeave={handleActionEnd}
        onTouchStart={handlePlusStart}
        onTouchEnd={handleActionEnd}
        className="w-12 h-12 rounded-xl bg-[#F2EDE6] dark:bg-[#131110] flex items-center justify-center active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Increase value"
      >
        <Plus size={20} strokeWidth={1.75} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
      </button>
    </div>
  )
}

export default Stepper;
