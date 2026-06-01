export function PrimaryButton({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button'
}) {
  const hasBgClass = className.split(' ').some(c => c.startsWith('bg-'))
  const bgClass = hasBgClass ? '' : 'bg-[#7A9B7E] dark:bg-[#8FB393]'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[52px] rounded-xl font-semibold text-base text-white ${bgClass} active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9B7E]/60 dark:focus-visible:ring-[#8FB393]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton;
