export function SecondaryButton({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[52px] rounded-xl font-medium text-base text-accent-sage bg-accent-sage/10 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage/60 disabled:opacity-50 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default SecondaryButton;
