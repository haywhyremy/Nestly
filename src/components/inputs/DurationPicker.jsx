import { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';

export function DurationPicker({ value = 15, onChange, maxHours = 3 }) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  const updateHours = (newHours) => {
    const clamped = Math.max(0, Math.min(maxHours, newHours));
    onChange(clamped * 60 + minutes);
  };

  const updateMinutes = (newMinutes) => {
    // Wrap around: if minutes go below 0, go to 55. If above 55, go to 0.
    let clamped = newMinutes;
    if (clamped < 0) clamped = 55;
    if (clamped > 55) clamped = 0;
    onChange(hours * 60 + clamped);
  };

  const handleHoursInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      updateHours(val);
    }
  };

  const handleMinutesInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 55) {
      onChange(hours * 60 + val);
    }
  };

  // Long press support
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const startLongPress = (action) => {
    action(); // Fire once immediately
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 150);
    }, 500);
  };

  const stopLongPress = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      <p className="text-xs font-medium text-[#6B6259] dark:text-[#A89F94] uppercase tracking-wider mb-3">
        Duration
      </p>
      <div className="bg-[#FFFFFF] dark:bg-[#242220] border border-[#F2EDE6] dark:border-[#2A2A28] rounded-xl p-4">
        <div className="flex items-center justify-center gap-3">
          
          {/* Hours control group */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={() => startLongPress(() => updateHours(hours - 1))}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress(() => updateHours(hours - 1))}
              onTouchEnd={stopLongPress}
              disabled={hours <= 0}
              className="w-10 h-10 rounded-xl bg-[#F2EDE6] dark:bg-[#131110] flex items-center justify-center active:brightness-95 disabled:opacity-30 select-none"
              aria-label="Decrease hours"
            >
              <Minus size={16} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
            </button>
            
            <div className="flex items-baseline gap-1 min-w-[50px] justify-center">
              <input
                type="number"
                min="0"
                max={maxHours}
                value={hours}
                onChange={handleHoursInput}
                className="w-[36px] text-center text-xl font-bold text-[#1F1B16] dark:text-[#F0ECE6] bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
              <span className="text-sm text-[#6B6259] dark:text-[#A89F94]">h</span>
            </div>
            
            <button
              type="button"
              onMouseDown={() => startLongPress(() => updateHours(hours + 1))}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress(() => updateHours(hours + 1))}
              onTouchEnd={stopLongPress}
              disabled={hours >= maxHours}
              className="w-10 h-10 rounded-xl bg-[#F2EDE6] dark:bg-[#131110] flex items-center justify-center active:brightness-95 disabled:opacity-30 select-none"
              aria-label="Increase hours"
            >
              <Plus size={16} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
            </button>
          </div>

          {/* Colon separator */}
          <span className="text-xl font-bold text-[#1F1B16] dark:text-[#F0ECE6] mx-1">:</span>

          {/* Minutes control group */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={() => startLongPress(() => updateMinutes(minutes - 5))}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress(() => updateMinutes(minutes - 5))}
              onTouchEnd={stopLongPress}
              className="w-10 h-10 rounded-xl bg-[#F2EDE6] dark:bg-[#131110] flex items-center justify-center active:brightness-95 select-none"
              aria-label="Decrease minutes"
            >
              <Minus size={16} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
            </button>
            
            <div className="flex items-baseline gap-1 min-w-[50px] justify-center">
              <input
                type="number"
                min="0"
                max="55"
                step="5"
                value={minutes}
                onChange={handleMinutesInput}
                className="w-[36px] text-center text-xl font-bold text-[#1F1B16] dark:text-[#F0ECE6] bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
              <span className="text-sm text-[#6B6259] dark:text-[#A89F94]">m</span>
            </div>
            
            <button
              type="button"
              onMouseDown={() => startLongPress(() => updateMinutes(minutes + 5))}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress(() => updateMinutes(minutes + 5))}
              onTouchEnd={stopLongPress}
              className="w-10 h-10 rounded-xl bg-[#F2EDE6] dark:bg-[#131110] flex items-center justify-center active:brightness-95 select-none"
              aria-label="Increase minutes"
            >
              <Plus size={16} className="text-[#1F1B16] dark:text-[#F0ECE6]" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default DurationPicker;
